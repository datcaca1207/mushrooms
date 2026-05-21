import { z } from 'zod'
import { cameraRepository } from '../repositories/cameraRepository.js'

const createSchema = z.object({
  zoneId: z.string().uuid().optional(),
  name: z.string().min(2),
  streamUrl: z.string().url(),
  location: z.string().optional(),
  aiEnabled: z.boolean().default(true),
  lastDetection: z.string().optional(),
  diseaseRiskPct: z.number().min(0).max(100).optional(),
  isOnline: z.boolean().default(true),
})

const updateSchema = createSchema.partial()

export const camerasController = {
  async list(req, res, next) {
    try {
      res.json(await cameraRepository.list())
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const camera = await cameraRepository.findById(req.params.id)
      if (!camera) return res.status(404).json({ message: 'Camera not found' })
      res.json(camera)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const payload = createSchema.parse(req.body)
      const camera = await cameraRepository.create(payload)
      res.status(201).json(camera)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const payload = updateSchema.parse(req.body)
      const camera = await cameraRepository.update(req.params.id, payload)
      res.json(camera)
    } catch (error) {
      next(error)
    }
  },

  async remove(req, res, next) {
    try {
      await cameraRepository.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
