import { z } from 'zod'
import { deviceRepository } from '../repositories/deviceRepository.js'
import { mqttService } from '../services/mqttService.js'

const createSchema = z.object({
  zoneId: z.string().uuid().optional(),
  name: z.string().min(2),
  key: z.string().min(2),
  topic: z.string().min(3),
  status: z.string().default('OFF'),
  autoEnabled: z.boolean().default(true),
})

const updateSchema = z.object({
  zoneId: z.string().uuid().optional(),
  name: z.string().min(2).optional(),
  topic: z.string().min(3).optional(),
  status: z.string().optional(),
  isOnline: z.boolean().optional(),
  autoEnabled: z.boolean().optional(),
})

const commandSchema = z.object({
  command: z.string().min(2),
})

export const devicesController = {
  async list(req, res, next) {
    try {
      res.json(await deviceRepository.list())
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const device = await deviceRepository.findById(req.params.id)
      if (!device) return res.status(404).json({ message: 'Device not found' })
      res.json(device)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const payload = createSchema.parse(req.body)
      const device = await deviceRepository.create(payload)
      res.status(201).json(device)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const payload = updateSchema.parse(req.body)
      const device = await deviceRepository.update(req.params.id, payload)
      res.json(device)
    } catch (error) {
      next(error)
    }
  },

  async remove(req, res, next) {
    try {
      await deviceRepository.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },

  async control(req, res, next) {
    try {
      const payload = commandSchema.parse(req.body)
      const device = await deviceRepository.findById(req.params.id)
      if (!device) return res.status(404).json({ message: 'Device not found' })

      mqttService.publishDeviceControl(device.key, payload.command, { requestedBy: req.user.email })
      res.json({ message: 'Command published', key: device.key, command: payload.command })
    } catch (error) {
      next(error)
    }
  },
}
