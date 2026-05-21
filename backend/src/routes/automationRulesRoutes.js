import { Router } from 'express'
import { automationRulesController } from '../controllers/automationRulesController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', automationRulesController.list)
router.get('/:id', automationRulesController.getById)
router.post('/', authorize('ADMIN', 'OPERATOR'), automationRulesController.create)
router.patch('/:id', authorize('ADMIN', 'OPERATOR'), automationRulesController.update)
router.delete('/:id', authorize('ADMIN'), automationRulesController.remove)

export { router as automationRulesRoutes }
