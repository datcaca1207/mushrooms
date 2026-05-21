import { Router } from 'express'
import { zonesController } from '../controllers/zonesController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', zonesController.list)
router.get('/:id', zonesController.getById)
router.post('/', authorize('ADMIN', 'OPERATOR'), zonesController.create)
router.patch('/:id', authorize('ADMIN', 'OPERATOR'), zonesController.update)
router.delete('/:id', authorize('ADMIN'), zonesController.remove)

export { router as zonesRoutes }
