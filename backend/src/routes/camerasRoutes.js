import { Router } from 'express'
import { camerasController } from '../controllers/camerasController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', camerasController.list)
router.get('/:id', camerasController.getById)
router.post('/', authorize('ADMIN', 'OPERATOR'), camerasController.create)
router.patch('/:id', authorize('ADMIN', 'OPERATOR'), camerasController.update)
router.delete('/:id', authorize('ADMIN'), camerasController.remove)

export { router as camerasRoutes }
