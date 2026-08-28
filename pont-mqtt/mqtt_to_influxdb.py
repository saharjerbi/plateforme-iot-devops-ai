#!/usr/bin/env python3
"""Pont MQTT → InfluxDB — écrit réellement les mesures dans la base de données.

En mode SIMULATION, les données sont seulement affichées.
En mode PRODUCTION (MODE=production), les données sont écrites dans InfluxDB.
"""

import paho.mqtt.client as mqtt
import json
import time
import os
from datetime import datetime

MODE = os.getenv("MODE", "production")  # production | simulation
BROKER_IP = os.getenv("MQTT_HOST", "localhost")
BROKER_PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = "sensor/dht22"
CLIENT_ID = f"mqtt_bridge_{int(time.time())}"

INFLUXDB_HOST = os.getenv("INFLUXDB_HOST", "influxdb")
INFLUXDB_PORT = int(os.getenv("INFLUXDB_PORT", 8086))
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN", "iot-token-2024")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG", "iot-org")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "capteurs")

# ── Initialisation du client InfluxDB (lazy) ──────────────────────────────
_write_api = None


def get_write_api():
    """Retourne (et crée si nécessaire) l'API d'écriture InfluxDB."""
    global _write_api
    if _write_api is not None:
        return _write_api

    if MODE != "production":
        return None

    from influxdb_client import InfluxDBClient
    from influxdb_client.client.write_api import SYNCHRONOUS

    client = InfluxDBClient(
        url=f"http://{INFLUXDB_HOST}:{INFLUXDB_PORT}",
        token=INFLUXDB_TOKEN,
        org=INFLUXDB_ORG,
    )
    _write_api = client.write_api(write_options=SYNCHRONOUS)
    print(f"✅ Connecté à InfluxDB ({INFLUXDB_HOST}:{INFLUXDB_PORT}, bucket={INFLUXDB_BUCKET})")
    return _write_api


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connecté au broker MQTT {BROKER_IP}:{BROKER_PORT}")
        client.subscribe(TOPIC)
        print(f"📡 Abonné au topic: {TOPIC}")
        print(f"🔧 Mode: {MODE.upper()}")
        if MODE == "production":
            get_write_api()
        print("=" * 50)
    else:
        print(f"❌ Échec connexion MQTT, code: {rc}")


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        temp = payload.get("temperature")
        hum = payload.get("humidity")
        source = payload.get("source", "inconnue")
        now = datetime.now()
        timestamp_ns = int(now.timestamp() * 1e9)
        timestamp = now.strftime("%H:%M:%S")

        print(f"\n[{timestamp}] 📥 Message reçu:")
        print(f"         Temp: {temp}°C, Hum: {hum}%, Source: {source}")

        # ── Line Protocol (pour InfluxDB) ──────────────────────────────────
        line = f"capteur_dht22,source={source} temperature={temp},humidity={hum} {timestamp_ns}"

        if MODE == "production":
            write_api = get_write_api()
            if write_api:
                try:
                    write_api.write(
                        bucket=INFLUXDB_BUCKET,
                        org=INFLUXDB_ORG,
                        record=line,
                    )
                    print(f"         💾 Écrit dans InfluxDB (bucket={INFLUXDB_BUCKET})")
                except Exception as influx_err:
                    print(f"         ❌ Erreur InfluxDB: {influx_err}")
            else:
                print(f"         ⚠️ Write API non initialisée — Line Protocol: {line}")
        else:
            print(f"         💾 [SIMULATION] Line Protocol: {line}")

    except Exception as e:
        print(f"❌ Erreur de traitement: {e}")


def on_disconnect(client, userdata, rc):
    if rc != 0:
        print("⚠️ Déconnecté du broker MQTT — tentative de reconnexion...")


client = mqtt.Client(client_id=CLIENT_ID, clean_session=True)
client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect
client.reconnect_delay_set(min_delay=1, max_delay=30)

try:
    print("🚀 Pont MQTT → InfluxDB")
    print(f"   Broker  : {BROKER_IP}:{BROKER_PORT}")
    print(f"   Topic   : {TOPIC}")
    print(f"   Mode    : {MODE}")
    if MODE == "production":
        print(f"   Influx  : http://{INFLUXDB_HOST}:{INFLUXDB_PORT} (org={INFLUXDB_ORG}, bucket={INFLUXDB_BUCKET})")
    print("⏹️  Ctrl+C pour arrêter\n")
    client.connect(BROKER_IP, BROKER_PORT, keepalive=60)
    client.loop_forever()
except KeyboardInterrupt:
    print("\n🛑 Arrêt...")
finally:
    client.disconnect()
