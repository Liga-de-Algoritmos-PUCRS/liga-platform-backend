export const SENSITIVE_LOG_FIELDS = ['password', 'newPassword', 'token'] as const;

export function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...obj };

  for (const field of SENSITIVE_LOG_FIELDS) {
    if (sanitized[field] !== undefined) {
      sanitized[field] = '****';
    }
  }

  return sanitized;
}
