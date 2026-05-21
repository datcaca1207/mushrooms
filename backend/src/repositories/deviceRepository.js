import { prisma } from '../config/prisma.js'

export const deviceRepository = {
  create: (data) => prisma.device.create({ data }),
  list: () => prisma.device.findMany({ orderBy: { createdAt: 'desc' } }),
  findById: (id) => prisma.device.findUnique({ where: { id } }),
  findByKey: (key) => prisma.device.findUnique({ where: { key } }),
  update: (id, data) => prisma.device.update({ where: { id }, data }),
  remove: (id) => prisma.device.delete({ where: { id } }),
}
