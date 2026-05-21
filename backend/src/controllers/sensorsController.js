import { z } from 'zod'
import { sensorRepository } from '../repositories/sensorRepository.js'

const createSchema = z.object({
  zoneId: z.string().uuid().optional(),
  name: z.string().min(2),
  metric: z.string().min(2),
  unit: z.string().default(''),
  topic: z.string().min(3),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
})

const updateSchema = z.object({
  zoneId: z.string().uuid().optional(),
  name: z.string().min(2).optional(),
  metric: z.string().min(2).optional(),
  unit: z.string().optional(),
  topic: z.string().min(3).optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const sensorsController = {
  async list(req, res, next) {
    try {
      const sensors = await sensorRepository.list()
      res.json(sensors)
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const sensor = await sensorRepository.findById(req.params.id)
      if (!sensor) return res.status(404).json({ message: 'Sensor not found' })
      res.json(sensor)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const payload = createSchema.parse(req.body)
      const sensor = await sensorRepository.create(payload)
      res.status(201).json(sensor)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const payload = updateSchema.parse(req.body)
      const sensor = await sensorRepository.update(req.params.id, payload)
      res.json(sensor)
    } catch (error) {
      next(error)
    }
  },

  async remove(req, res, next) {
    try {
      await sensorRepository.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },

  async readings(req, res, next) {
    try {
      const data = await sensorRepository.latestReadings(req.params.id)
      res.json(data)
    } catch (error) {
      next(error)
    }
  },
}
