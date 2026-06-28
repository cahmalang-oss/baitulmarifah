type Attempt = { count: number; blockedUntil: number | null }
const attempts = new Map<string, Attempt>()

export function checkRateLimit(key: string, options?: { maxAttempts?: number; blockDurationMs?: number }): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const attempt = attempts.get(key)

  if (!attempt) {
    return { allowed: true }
  }

  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((attempt.blockedUntil - now) / 1000) }
  }

  if (attempt.blockedUntil && now >= attempt.blockedUntil) {
    // Unblock
    attempts.delete(key)
    return { allowed: true }
  }

  return { allowed: true }
}

export function recordFailedAttempt(key: string, options?: { maxAttempts?: number; blockDurationMs?: number }) {
  const now = Date.now()
  const attempt = attempts.get(key) || { count: 0, blockedUntil: null }
  
  attempt.count += 1
  
  const max = options?.maxAttempts || 5
  const duration = options?.blockDurationMs || 15 * 60 * 1000
  
  if (attempt.count >= max) {
    attempt.blockedUntil = now + duration
  }
  
  attempts.set(key, attempt)
}

export function resetFailedAttempt(key: string) {
  attempts.delete(key)
}
