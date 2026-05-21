import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'
import { initializeSocket } from './services/socketService.js'
import { mqttService } from './services/mqttService.js'
import { automationEngine } from './services/automationEngine.js'

const app = createApp()
const httpServer = createServer(app)

const io = new SocketIOServer(httpServer, {
  cors: { origin: env.FRONTEND_ORIGIN === '*' ? true : env.FRONTEND_ORIGIN },
})

initializeSocket(io)
automationEngine.setSocket(io)
mqttService.initialize(io, automationEngine)

httpServer.listen(env.PORT, () => {
  logger.info(`Backend running on http://localhost:${env.PORT}`)
})
