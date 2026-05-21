import { prisma } from '../config/prisma.js'

export const dashboardController = {
  async summary(req, res, next) {
    try {
      const [zones, sensors, devices, activeAlerts, latestCamera] = await Promise.all([
        prisma.zone.count({ where: { isActive: true } }),
        prisma.sensor.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 50,
          select: { id: true, name: true, metric: true, unit: true, lastValue: true, zoneId: true, lastSeenAt: true },
        }),
        prisma.device.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 50,
          select: { id: true, key: true, name: true, status: true, isOnline: true, zoneId: true, updatedAt: true },
        }),
        prisma.alertLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
        prisma.camera.findMany({ orderBy: { updatedAt: 'desc' }, take: 10 }),
      ])

      res.json({
        zones,
        sensors,
        devices,
        alerts: activeAlerts,
        cameras: latestCamera,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      next(error)
    }
  },
}
