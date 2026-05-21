import { Router } from 'express'
import { devicesController } from '../controllers/devicesController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', devicesController.list)
router.get('/:id', devicesController.getById)
router.post('/', authorize('ADMIN', 'OPERATOR'), devicesController.create)
router.patch('/:id', authorize('ADMIN', 'OPERATOR'), devicesController.update)
router.delete('/:id', authorize('ADMIN'), devicesController.remove)
router.post('/:id/control', authorize('ADMIN', 'OPERATOR'), devicesController.control)

export { router as devicesRoutes }
