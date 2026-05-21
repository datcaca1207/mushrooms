import mqtt from 'mqtt'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'
import { sensorRepository } from '../repositories/sensorRepository.js'
import { deviceRepository } from '../repositories/deviceRepository.js'
import { alertService } from './alertService.js'

class MqttService {
  constructor() {
    this.client = null
    this.io = null
    this.automationEngine = null
  }

  initialize(io, automationEngine) {
    this.io = io
    this.automationEngine = automationEngine

    this.client = mqtt.connect(env.MQTT_BROKER_URL, {
      clientId: env.MQTT_CLIENT_ID,
      username: env.MQTT_USERNAME || undefined,
      password: env.MQTT_PASSWORD || undefined,
      reconnectPeriod: 3000,
    })

    this.client.on('connect', () => {
      logger.info('MQTT connected')
      this.client.subscribe('farm/sensors/+/data', { qos: env.MQTT_QOS })
      this.client.subscribe('farm/devices/+/status', { qos: env.MQTT_QOS })
      this.client.subscribe('farm/+/+/sensors/data', { qos: env.MQTT_QOS })
      this.client.subscribe('farm/+/+/devices/state', { qos: env.MQTT_QOS })
      this.client.subscribe('farm/+/+/ai/events', { qos: env.MQTT_QOS })
      this.client.subscribe('farm/+/+/ai/alerts', { qos: env.MQTT_QOS })
    })

    this.client.on('message', (topic, payload) => this.handleMessage(topic, payload))
    this.client.on('error', (error) => logger.error('MQTT error', error.message))
  }

  async handleMessage(topic, payloadBuffer) {
    const payloadText = payloadBuffer.toString('utf8')
    let payload

    try {
      payload = JSON.parse(payloadText)
    } catch {
      payload = { value: Number(payloadText), raw: payloadText }
    }

    if (topic.startsWith('farm/') && topic.endsWith('/sensors/data')) {
      const parts = topic.split('/')
      const sensorKey = parts.length === 4 ? parts[2] : payload.metric || 'sensor'
      const farmId = parts.length >= 5 ? parts[1] : payload.farmId || 'default'
      const zoneOrDevice = parts.length >= 5 ? parts[2] : 'zone-default'
      const metric = payload.metric || sensorKey
      const sensorTopic = topic

      let sensor = await sensorRepository.findByTopic(sensorTopic)
      if (!sensor) {
        sensor = await sensorRepository.create({
          name: `${zoneOrDevice}-${metric}`.toUpperCase(),
          metric,
          unit: payload.unit || '',
          topic: sensorTopic,
          location: payload.location || farmId,
        })
      }

      const sensorMap = payload.sensors && typeof payload.sensors === 'object' ? payload.sensors : null
      const values = []

      if (sensorMap) {
        for (const [metricName, metricValue] of Object.entries(sensorMap)) {
          const numeric = Number(metricValue)
          if (!Number.isNaN(numeric)) {
            values.push({ metricName, value: numeric })
          }
        }
      } else {
        const singleValue = Number(payload.value)
        if (!Number.isNaN(singleValue)) {
          values.push({ metricName: metric, value: singleValue })
        }
      }

      for (const reading of values) {
        await sensorRepository.createReading({
          sensorId: sensor.id,
          value: reading.value,
          rawPayload: payload,
        })

        await sensorRepository.update(sensor.id, {
          metric: reading.metricName,
          lastValue: reading.value,
          lastSeenAt: new Date(),
        })

        this.io?.emit('sensor:update', {
          sensorId: sensor.id,
          metric: reading.metricName,
          value: reading.value,
          unit: sensor.unit,
          farmId,
          zone: zoneOrDevice,
          timestamp: new Date().toISOString(),
        })

        await this.automationEngine?.evaluate({
          metric: reading.metricName,
          value: reading.value,
          unit: sensor.unit,
          source: sensor.name,
        })
      }
    }

    if (topic.startsWith('farm/') && (topic.endsWith('/status') || topic.endsWith('/devices/state'))) {
      const parts = topic.split('/')
      const deviceKey = parts.length >= 3 ? parts[2] : payload.deviceId || 'unknown-device'
      const farmId = parts.length >= 3 ? parts[1] : payload.farmId || 'default'
      const status = (payload.status || payload.state || 'UNKNOWN').toUpperCase()

      const device = await deviceRepository.findByKey(deviceKey)
      if (device) {
        await deviceRepository.update(device.id, {
          status,
          isOnline: true,
          lastSeenAt: new Date(),
        })
      }

      this.io?.emit('device:update', {
        key: deviceKey,
        status,
        farmId,
        payload,
        timestamp: new Date().toISOString(),
      })
    }

    if (topic.startsWith('farm/') && (topic.endsWith('/ai/events') || topic.endsWith('/ai/alerts'))) {
      const level = topic.endsWith('/ai/alerts') ? 'WARNING' : 'INFO'
      this.io?.emit('ai:update', {
        topic,
        payload,
        timestamp: new Date().toISOString(),
      })

      if (topic.endsWith('/ai/alerts')) {
        await alertService.notify(level, 'AI Camera Alert', payload.message || 'AI anomaly detected', payload)
      }
    }
  }

  publishDeviceControl(deviceKey, command, metadata = {}) {
    if (!this.client?.connected) {
      throw new Error('MQTT broker is not connected')
    }

    const farmId = metadata.farmId || 'mushroom-farm-a1'
    const topic = `farm/devices/${deviceKey}/set`
    const edgeTopic = `farm/${farmId}/${deviceKey}/control/set`
    const payload = JSON.stringify({ command, metadata, timestamp: new Date().toISOString() })
    this.client.publish(topic, payload, { qos: env.MQTT_QOS })
    this.client.publish(edgeTopic, payload, { qos: env.MQTT_QOS })

    this.io?.emit('device:command', {
      deviceKey,
      command,
      topic,
      edgeTopic,
      timestamp: new Date().toISOString(),
    })
  }
}

export const mqttService = new MqttService()
