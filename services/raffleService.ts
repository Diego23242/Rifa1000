
// Usaremos un bucket único basado en el dominio para guardar los datos permanentemente
const BUCKET_ID = 'rifa_1000_storage_' + window.location.hostname.replace(/\./g, '_');
const KV_URL = `https://kvdb.io/6E3WjXv7J9Y2L9K6W6Y5M1/${BUCKET_ID}`; // Bucket público persistente
const MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt';
const MQTT_TOPIC = `rifa/sync/${BUCKET_ID}`;

let mqttClient: any = null;

export const raffleService = {
  // 1. PERSISTENCIA: Cargar desde la base de datos
  loadPersistedData: async (): Promise<number[]> => {
    try {
      const res = await fetch(KV_URL);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (e) {
      console.warn("No hay datos previos o error de red:", e);
      return [];
    }
  },

  // 2. PERSISTENCIA: Guardar en la base de datos
  savePersistedData: async (soldNumbers: number[]) => {
    try {
      await fetch(KV_URL, {
        method: 'POST',
        body: JSON.stringify(soldNumbers)
      });
    } catch (e) {
      console.error("Error guardando en la nube:", e);
    }
  },

  // 3. TIEMPO REAL: Conectar para avisar a otros dispositivos
  connectRealtime: (onUpdate: (num: number, isSold: boolean) => void) => {
    // @ts-ignore
    mqttClient = window.mqtt.connect(MQTT_BROKER);
    
    mqttClient.on('connect', () => {
      mqttClient.subscribe(MQTT_TOPIC);
    });

    mqttClient.on('message', (topic: string, message: any) => {
      try {
        const payload = JSON.parse(message.toString());
        onUpdate(payload.num, payload.isSold);
      } catch (e) {}
    });
  },

  broadcastChange: (num: number, isSold: boolean) => {
    if (mqttClient) {
      mqttClient.publish(MQTT_TOPIC, JSON.stringify({ num, isSold }));
    }
  },

  createBase: () => {
    return Array.from({ length: 1000 }, (_, i) => ({
      number: i + 1,
      isSold: false
    }));
  }
};
