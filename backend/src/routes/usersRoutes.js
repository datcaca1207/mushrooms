import { Router } from 'express'
import { usersController } from '../controllers/usersController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/', usersController.list)
router.get('/:id', usersController.getById)
router.post('/', usersController.create)
router.patch('/:id', usersController.update)
router.delete('/:id', usersController.remove)

export { router as usersRoutes }
