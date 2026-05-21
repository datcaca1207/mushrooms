import { z } from 'zod'
import { authService } from '../services/authService.js'

const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authController = {
  async register(req, res, next) {
    try {
      const payload = registerSchema.parse(req.body)
      const result = await authService.register(payload)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  },

  async login(req, res, next) {
    try {
      const payload = loginSchema.parse(req.body)
      const result = await authService.login(payload.email, payload.password)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  async me(req, res) {
    res.json({ user: req.user })
  },
}
