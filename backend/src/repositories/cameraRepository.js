import { prisma } from '../config/prisma.js'

export const cameraRepository = {
  create: (data) => prisma.camera.create({ data }),
  list: () => prisma.camera.findMany({ orderBy: { createdAt: 'desc' } }),
  findById: (id) => prisma.camera.findUnique({ where: { id } }),
  update: (id, data) => prisma.camera.update({ where: { id }, data }),
  remove: (id) => prisma.camera.delete({ where: { id } }),
}
