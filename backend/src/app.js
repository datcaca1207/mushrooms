import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.FRONTEND_ORIGIN === '*' ? true : env.FRONTEND_ORIGIN }))
  app.use(helmet())
  app.use(morgan('dev'))
  app.use(express.json({ limit: '2mb' }))

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'smart-mushroom-farm-backend', env: env.NODE_ENV })
  })

  app.use(env.API_PREFIX, apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
