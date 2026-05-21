import { Router } from 'express'
import { sensorsController } from '../controllers/sensorsController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', sensorsController.list)
router.get('/:id', sensorsController.getById)
router.get('/:id/readings', sensorsController.readings)
router.post('/', authorize('ADMIN', 'OPERATOR'), sensorsController.create)
router.patch('/:id', authorize('ADMIN', 'OPERATOR'), sensorsController.update)
router.delete('/:id', authorize('ADMIN'), sensorsController.remove)

export { router as sensorsRoutes }
