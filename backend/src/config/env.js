import dotenv from 'dotenv'

dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4010),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || '*',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'replace_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',

  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  MQTT_CLIENT_ID: process.env.MQTT_CLIENT_ID || 'mushroom-farm-backend',
  MQTT_USERNAME: process.env.MQTT_USERNAME || '',
  MQTT_PASSWORD: process.env.MQTT_PASSWORD || '',
  MQTT_QOS: Number(process.env.MQTT_QOS || 1),

  TELEGRAM_ENABLED: process.env.TELEGRAM_ENABLED === 'true',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',

  ZALO_ENABLED: process.env.ZALO_ENABLED === 'true',
  ZALO_WEBHOOK_URL: process.env.ZALO_WEBHOOK_URL || '',

  SMS_ENABLED: process.env.SMS_ENABLED === 'true',
  SMS_WEBHOOK_URL: process.env.SMS_WEBHOOK_URL || '',
  SMS_API_KEY: process.env.SMS_API_KEY || '',
}
