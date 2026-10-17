const { redisClient } = require('../config/db');

/**
 * Middleware Rate Limiter su dung Redis Token/Counter Bucket
 * Gioi han tan suat goi API tranh spam va tan cong DoS
 */
function createRateLimiter({ windowSeconds = 60, maxRequests = 60, keyPrefix = 'ratelimit' } = {}) {
  return async (req, res, next) => {
    try {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const userKey = req.user ? req.user.username : clientIp;
      const redisKey = `${keyPrefix}:${userKey}`;

      // Thuc thi atomic INCR
      const requestsCount = await redisClient.incr(redisKey);

      if (requestsCount === 1) {
        // Dat TTL cho chu ky
        await redisClient.expire(redisKey, windowSeconds);
      }

      const ttl = await redisClient.ttl(redisKey);

      // Thiet lap cac Header tieu chuan cua Rate Limit
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestsCount));
      res.setHeader('X-RateLimit-Reset', ttl);

      if (requestsCount > maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'TOO_MANY_REQUESTS',
          message: `Bạn đang thực hiện thao tác quá nhanh. Vui lòng thử lại sau ${ttl} giây.`,
          retryAfter: ttl
        });
      }

      next();
    } catch (err) {
      // Neu Redis gap su co tam thoi thi cho request qua de khong gay block he thong
      console.error('[RateLimiter Error]:', err.message);
      next();
    }
  };
}

module.exports = { createRateLimiter };
