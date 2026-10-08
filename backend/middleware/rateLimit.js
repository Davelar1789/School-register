// Tiny in-memory limiter (per IP + route) — enough to blunt password guessing without a new dependency.
const hits = new Map();

export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 20, message = "Too many attempts. Please try again later." } = {}) =>
  (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ message });
    }
    next();
  };

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
}, 10 * 60 * 1000).unref();
