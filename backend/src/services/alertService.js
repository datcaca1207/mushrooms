import axios from 'axios'
import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'
import { logger } from '../utils/logger.js'

export const alertService = {
  async notify(level, title, message, metadata = {}) {
    const entries = []

    entries.push(this.sendSystem(level, title, message, metadata))

    if (env.TELEGRAM_ENABLED) {
      entries.push(this.sendTelegram(level, title, message, metadata))
    }
    if (env.ZALO_ENABLED) {
      entries.push(this.sendZalo(level, title, message, metadata))
    }
    if (env.SMS_ENABLED) {
      entries.push(this.sendSms(level, title, message, metadata))
    }

    return Promise.allSettled(entries)
  },

  async log(channel, level, title, message, metadata, sent) {
    await prisma.alertLog.create({
      data: {
        channel,
        level,
        title,
        message,
        metadata,
        sent,
      },
    })
  },

  async sendSystem(level, title, message, metadata) {
    await this.log('SYSTEM', level, title, message, metadata, true)
    logger.warn(`[${level}] ${title}: ${message}`)
  },

  async sendTelegram(level, title, message, metadata) {
    try {
      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`
      await axios.post(url, {
        chat_id: env.TELEGRAM_CHAT_ID,
        text: `*${title}*\nLevel: ${level}\n${message}`,
        parse_mode: 'Markdown',
      })
      await this.log('TELEGRAM', level, title, message, metadata, true)
    } catch (error) {
      await this.log('TELEGRAM', level, title, message, metadata, false)
      logger.error('Telegram alert failed', error.message)
    }
  },

  async sendZalo(level, title, message, metadata) {
    try {
      await axios.post(env.ZALO_WEBHOOK_URL, { level, title, message, metadata })
      await this.log('ZALO', level, title, message, metadata, true)
    } catch (error) {
      await this.log('ZALO', level, title, message, metadata, false)
      logger.error('Zalo alert failed', error.message)
    }
  },

  async sendSms(level, title, message, metadata) {
    try {
      await axios.post(
        env.SMS_WEBHOOK_URL,
        { title, level, message, metadata },
        { headers: { Authorization: `Bearer ${env.SMS_API_KEY}` } },
      )
      await this.log('SMS', level, title, message, metadata, true)
    } catch (error) {
      await this.log('SMS', level, title, message, metadata, false)
      logger.error('SMS alert failed', error.message)
    }
  },
}
