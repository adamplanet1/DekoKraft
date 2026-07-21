const buckets = new Map<string, number[]>();

export function assertParticipantMaintenanceRateLimit(participantId: string, action: string, limit = 12, windowMs = 15 * 60_000): void {
  const key = `${participantId}:${action}`;
  const cutoff = Date.now() - windowMs;
  const recent = (buckets.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
  if (recent.length >= limit) throw new Error("تم تجاوز الحد المؤقت للعمليات. حاول مرة أخرى لاحقًا.");
  recent.push(Date.now());
  buckets.set(key, recent);
}

export function clearParticipantMaintenanceRateLimits(): void { buckets.clear(); }
