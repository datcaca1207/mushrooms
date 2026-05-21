import { z } from 'zod'
import { zoneRepository } from '../repositories/zoneRepository.js'

const createSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

const updateSchema = createSchema.partial()

export const zonesController = {
  async list(req, res, next) {
    try {
      res.json(await zoneRepository.list())
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const zone = await zoneRepository.findById(req.params.id)
      if (!zone) return res.status(404).json({ message: 'Zone not found' })
      res.json(zone)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const payload = createSchema.parse(req.body)
      const zone = await zoneRepository.create(payload)
      res.status(201).json(zone)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const payload = updateSchema.parse(req.body)
      const zone = await zoneRepository.update(req.params.id, payload)
      res.json(zone)
    } catch (error) {
      next(error)
    }
  },

  async remove(req, res, next) {
    try {
      await zoneRepository.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
