import { z } from 'zod'
import { automationRuleRepository } from '../repositories/automationRuleRepository.js'

const createSchema = z.object({
  name: z.string().min(3),
  enabled: z.boolean().default(true),
  metric: z.string().min(2),
  operator: z.enum(['LT', 'LTE', 'GT', 'GTE', 'EQ', 'NEQ']),
  threshold: z.number(),
  actionDeviceKey: z.string().min(2),
  actionCommand: z.string().min(2),
  cooldownSeconds: z.number().int().positive().default(60),
  notificationLevel: z.enum(['INFO', 'WARNING', 'DANGER']).default('WARNING'),
})

const updateSchema = createSchema.partial()

export const automationRulesController = {
  async list(req, res, next) {
    try {
      res.json(await automationRuleRepository.list())
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const rule = await automationRuleRepository.findById(req.params.id)
      if (!rule) return res.status(404).json({ message: 'Rule not found' })
      res.json(rule)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const payload = createSchema.parse(req.body)
      const rule = await automationRuleRepository.create(payload)
      res.status(201).json(rule)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const payload = updateSchema.parse(req.body)
      const rule = await automationRuleRepository.update(req.params.id, payload)
      res.json(rule)
    } catch (error) {
      next(error)
    }
  },

  async remove(req, res, next) {
    try {
      await automationRuleRepository.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
