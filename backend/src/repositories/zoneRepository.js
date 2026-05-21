import { prisma } from '../config/prisma.js'

export const zoneRepository = {
  create: (data) => prisma.zone.create({ data }),
  list: () => prisma.zone.findMany({ orderBy: { createdAt: 'desc' } }),
  findById: (id) => prisma.zone.findUnique({ where: { id } }),
  update: (id, data) => prisma.zone.update({ where: { id }, data }),
  remove: (id) => prisma.zone.delete({ where: { id } }),
}
