#!/usr/bin/env python3
import paho.mqtt.client as mqtt
import json
import time
import random

BROKER_IP = "172.21.249.96"
BROKER_PORT = 1883
TOPIC = "sensor/dht22"
CLIENT_ID = "simulateur_dht22"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connecté au broker {BROKER_IP}:{BROKER_PORT}")
    else:
        print(f"❌ Échec connexion, code: {rc}")

client = mqtt.Client(client_id=CLIENT_ID)
client.on_connect = on_connect

try:
    client.connect(BROKER_IP, BROKER_PORT, 60)
    client.loop_start()
    print("🚀 Simulateur DHT22 démarré")
    print(f"📡 Publication sur: {TOPIC}")
    print("⏹️  Ctrl+C pour arrêter\n")
    
    while True:
        temperature = round(20 + random.random() * 15, 1)
        humidity = round(40 + random.random() * 40, 1)
        payload = {
            "temperature": temperature,
            "humidity": humidity,
            "source": "simulateur_python"
        }
        client.publish(TOPIC, json.dumps(payload))
        print(f"📤 Publié: Temp={temperature}°C, Hum={humidity}%")
        time.sleep(5)

except KeyboardInterrupt:
    print("\n🛑 Arrêt...")
finally:
    client.loop_stop()
    client.disconnect()
