import { Router } from 'express'
import { authRoutes } from './authRoutes.js'
import { usersRoutes } from './usersRoutes.js'
import { sensorsRoutes } from './sensorsRoutes.js'
import { devicesRoutes } from './devicesRoutes.js'
import { automationRulesRoutes } from './automationRulesRoutes.js'
import { camerasRoutes } from './camerasRoutes.js'
import { zonesRoutes } from './zonesRoutes.js'
import { dashboardRoutes } from './dashboardRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/sensors', sensorsRoutes)
router.use('/devices', devicesRoutes)
router.use('/automation-rules', automationRulesRoutes)
router.use('/cameras', camerasRoutes)
router.use('/zones', zonesRoutes)
router.use('/dashboard', dashboardRoutes)

export { router as apiRouter }
