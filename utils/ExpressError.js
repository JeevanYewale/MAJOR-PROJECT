// Wrap async route handlers and pass errors to next()
module.exports = function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};