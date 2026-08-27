#!/usr/bin/env python3
import paho.mqtt.client as mqtt
import json
import time
import os
from datetime import datetime

MODE = "simulation"
BROKER_IP = os.getenv("MQTT_HOST", "localhost")
BROKER_PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = "sensor/dht22"
CLIENT_ID = f"mqtt_bridge_{int(time.time())}"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connecté au broker {BROKER_IP}:{BROKER_PORT}")
        client.subscribe(TOPIC)
        print(f"📡 Abonné au topic: {TOPIC}")
        print(f"🔧 Mode: {MODE.upper()}")
        print("=" * 50)
    else:
        print(f"❌ Échec connexion, code: {rc}")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        temp = payload.get("temperature")
        hum = payload.get("humidity")
        source = payload.get("source", "inconnue")
        now = datetime.now()
        timestamp = now.strftime("%H:%M:%S")
        
        print(f"\n[{timestamp}] 📥 Message reçu:")
        print(f"         Temp: {temp}°C, Hum: {hum}%, Source: {source}")
        
        line = f"capteur_dht22,source={source} temperature={temp},humidity={hum} {int(now.timestamp()*1e9)}"
        print(f"         💾 [SIMULATION] Line Protocol: {line}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

client = mqtt.Client(client_id=CLIENT_ID, clean_session=True)
client.on_connect = on_connect
client.on_message = on_message
client.reconnect_delay_set(min_delay=1, max_delay=30)

try:
    print("🚀 Pont MQTT → InfluxDB")
    print("⏹️  Ctrl+C pour arrêter\n")
    client.connect(BROKER_IP, BROKER_PORT, keepalive=60)
    client.loop_forever()
except KeyboardInterrupt:
    print("\n🛑 Arrêt...")
finally:
    client.disconnect()
