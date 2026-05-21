import { prisma } from '../config/prisma.js'

export const sensorRepository = {
  create: (data) => prisma.sensor.create({ data }),
  list: () => prisma.sensor.findMany({ orderBy: { createdAt: 'desc' } }),
  findById: (id) => prisma.sensor.findUnique({ where: { id } }),
  findByTopic: (topic) => prisma.sensor.findUnique({ where: { topic } }),
  update: (id, data) => prisma.sensor.update({ where: { id }, data }),
  remove: (id) => prisma.sensor.delete({ where: { id } }),
  createReading: (data) => prisma.sensorReading.create({ data }),
  latestReadings: (sensorId, take = 50) =>
    prisma.sensorReading.findMany({
      where: { sensorId },
      take,
      orderBy: { createdAt: 'desc' },
    }),
}
