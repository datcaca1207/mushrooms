import { mqttService } from './mqttService.js'
import { logger } from '../utils/logger.js'

export function initializeSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`)

    socket.on('device:control', ({ deviceKey, command }) => {
      try {
        mqttService.publishDeviceControl(deviceKey, command, { requestedBySocket: socket.id })
      } catch (error) {
        socket.emit('error:event', { message: error.message })
      }
    })

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`)
    })
  })
}
