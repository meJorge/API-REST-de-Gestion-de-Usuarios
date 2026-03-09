/**
 * Middleware factory para control de acceso por roles
 * @param {...string} roles - Roles permitidos para el endpoint
 * @returns middleware de Express
 *
 * Uso: authorize('admin') | authorize('admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado: no tienes permisos para esta acción',
      });
    }

    next();
  };
};

module.exports = authorize;
