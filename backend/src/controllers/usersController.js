import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { userRepository } from '../repositories/userRepository.js'

const createSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).default('VIEWER'),
  isActive: z.boolean().default(true),
})

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
})

export const usersController = {
  async list(req, res, next) {
    try {
      const users = await userRepository.list()
      res.json(users.map((u) => ({ ...u, passwordHash: undefined })))
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userRepository.findById(req.params.id)
      if (!user) return res.status(404).json({ message: 'User not found' })
      res.json({ ...user, passwordHash: undefined })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const payload = createSchema.parse(req.body)
      const passwordHash = await bcrypt.hash(payload.password, 10)
      const user = await userRepository.create({
        email: payload.email,
        fullName: payload.fullName,
        passwordHash,
        role: payload.role,
        isActive: payload.isActive,
      })
      res.status(201).json({ ...user, passwordHash: undefined })
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const payload = updateSchema.parse(req.body)
      const data = { ...payload }
      if (payload.password) {
        data.passwordHash = await bcrypt.hash(payload.password, 10)
        delete data.password
      }
      const user = await userRepository.update(req.params.id, data)
      res.json({ ...user, passwordHash: undefined })
    } catch (error) {
      next(error)
    }
  },

  async remove(req, res, next) {
    try {
      await userRepository.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
