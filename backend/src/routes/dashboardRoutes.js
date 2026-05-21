import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { dashboardController } from '../controllers/dashboardController.js'

const router = Router()

router.use(authenticate)
router.get('/summary', dashboardController.summary)

export { router as dashboardRoutes }
