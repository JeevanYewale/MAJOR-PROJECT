const cache = new Map();

const cacheMiddleware = (duration = 60) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedData = cache.get(key);

    if (cachedData && Date.now() - cachedData.timestamp < duration * 1000) {
      return res.json(cachedData.data);
    }

    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson.call(this, data);
    };

    next();
  };
};

const clearCache = () => cache.clear();

module.exports = { cacheMiddleware, clearCache };
