import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { userRepository } from '../repositories/userRepository.js'

export const authService = {
  async register(payload) {
    const exists = await userRepository.findByEmail(payload.email)
    if (exists) {
      const err = new Error('Email already registered')
      err.statusCode = 409
      throw err
    }

    const passwordHash = await bcrypt.hash(payload.password, 10)
    const user = await userRepository.create({
      email: payload.email,
      fullName: payload.fullName,
      passwordHash,
      role: payload.role || 'VIEWER',
    })

    return this.issueToken(user)
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email)
    if (!user || !user.isActive) {
      const err = new Error('Invalid credentials')
      err.statusCode = 401
      throw err
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      const err = new Error('Invalid credentials')
      err.statusCode = 401
      throw err
    }

    return this.issueToken(user)
  },

  issueToken(user) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    }
  },
}
