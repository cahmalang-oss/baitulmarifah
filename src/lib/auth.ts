import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'secret-for-development-only-change-this'
const secretKey = new TextEncoder().encode(JWT_SECRET)

export type JwtPayload = {
  id: string
  nama: string
  role: 'admin' | 'verifikator' | 'bendahara' | 'jamaah'
}

// Digunakan di Server (Node.js) / Edge
export async function signToken(payload: JwtPayload, expiresIn: string | number) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(typeof expiresIn === 'number' ? Math.floor(Date.now() / 1000) + expiresIn : expiresIn)
    .sign(secretKey)
}

// Digunakan di Server (Node.js) / Edge
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as unknown as JwtPayload
  } catch (error) {
    return null
  }
}

// Hanya untuk Node.js environment (API Routes)
export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 12)
}

export async function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash)
}
