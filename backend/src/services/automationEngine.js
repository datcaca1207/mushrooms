import { automationRuleRepository } from '../repositories/automationRuleRepository.js'
import { mqttService } from './mqttService.js'
import { alertService } from './alertService.js'
import { logger } from '../utils/logger.js'

class AutomationEngine {
  constructor() {
    this.io = null
  }

  setSocket(io) {
    this.io = io
  }

  async evaluate(sensorEvent) {
    const rules = await automationRuleRepository.listEnabled()

    for (const rule of rules) {
      if (rule.metric.toLowerCase() !== sensorEvent.metric.toLowerCase()) {
        continue
      }

      const shouldTrigger = this.compare(sensorEvent.value, rule.operator, rule.threshold)
      if (!shouldTrigger) {
        continue
      }

      const cooling = this.inCooldown(rule.lastTriggeredAt, rule.cooldownSeconds)
      if (cooling) {
        continue
      }

      try {
        mqttService.publishDeviceControl(rule.actionDeviceKey, rule.actionCommand, {
          ruleId: rule.id,
          reason: `${rule.metric} ${rule.operator} ${rule.threshold}`,
        })

        await automationRuleRepository.update(rule.id, { lastTriggeredAt: new Date() })

        const message = `Rule triggered: ${rule.name}. ${sensorEvent.metric}=${sensorEvent.value} => ${rule.actionDeviceKey}:${rule.actionCommand}`
        await alertService.notify(rule.notificationLevel, 'Automation Triggered', message, {
          ruleId: rule.id,
          sensorEvent,
        })

        this.io?.emit('automation:triggered', {
          ruleId: rule.id,
          ruleName: rule.name,
          sensorEvent,
          action: { deviceKey: rule.actionDeviceKey, command: rule.actionCommand },
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        logger.error('Automation trigger failed', error.message)
      }
    }
  }

  compare(value, operator, threshold) {
    if (operator === 'LT') return value < threshold
    if (operator === 'LTE') return value <= threshold
    if (operator === 'GT') return value > threshold
    if (operator === 'GTE') return value >= threshold
    if (operator === 'EQ') return value === threshold
    if (operator === 'NEQ') return value !== threshold
    return false
  }

  inCooldown(lastTriggeredAt, cooldownSeconds) {
    if (!lastTriggeredAt) return false
    const ms = cooldownSeconds * 1000
    return new Date(lastTriggeredAt).getTime() + ms > Date.now()
  }
}

export const automationEngine = new AutomationEngine()
