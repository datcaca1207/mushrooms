import { logger } from '../utils/logger.js'

function createMockDelegate() {
	return new Proxy(
		{},
		{
			get: (_, prop) => {
				if (prop === 'count') return async () => 0
				if (prop === 'findUnique') return async () => null
				if (prop === 'findFirst') return async () => null
				if (prop === 'findMany') return async () => []
				if (prop === 'create') return async (args) => args?.data || {}
				if (prop === 'update') return async (args) => args?.data || {}
				if (prop === 'delete') return async () => ({})
				return async () => {
					throw new Error(`Prisma unavailable: method ${String(prop)} cannot run without generated client`)
				}
			},
		},
	)
}

function createMockPrisma() {
	return new Proxy(
		{},
		{
			get: () => createMockDelegate(),
		},
	)
}

let prisma

try {
	const prismaModule = await import('@prisma/client')
	const PrismaClient = prismaModule.PrismaClient || prismaModule.default?.PrismaClient

	if (!PrismaClient) {
		throw new Error('PrismaClient export not found')
	}

	prisma = new PrismaClient()
} catch (error) {
	logger.warn('Prisma client is unavailable. Backend started in degraded mode.', error.message)
	prisma = createMockPrisma()
}

export { prisma }
