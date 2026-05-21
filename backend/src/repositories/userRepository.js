import { prisma } from '../config/prisma.js'

export const userRepository = {
  create: (data) => prisma.user.create({ data }),
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  findById: (id) => prisma.user.findUnique({ where: { id } }),
  list: () => prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
  update: (id, data) => prisma.user.update({ where: { id }, data }),
  remove: (id) => prisma.user.delete({ where: { id } }),
}
