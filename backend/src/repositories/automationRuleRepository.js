import { prisma } from '../config/prisma.js'

export const automationRuleRepository = {
  create: (data) => prisma.automationRule.create({ data }),
  list: () => prisma.automationRule.findMany({ orderBy: { createdAt: 'desc' } }),
  listEnabled: () => prisma.automationRule.findMany({ where: { enabled: true } }),
  findById: (id) => prisma.automationRule.findUnique({ where: { id } }),
  update: (id, data) => prisma.automationRule.update({ where: { id }, data }),
  remove: (id) => prisma.automationRule.delete({ where: { id } }),
}
