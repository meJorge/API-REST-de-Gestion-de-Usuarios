const { body, validationResult } = require('express-validator');

/**
 * Ejecuta las validaciones y responde con errores si los hay
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Datos inválidos',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Reglas para registro
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

  handleValidation,
];

// Reglas para login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Formato de email inválido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),

  handleValidation,
];

// Reglas para actualización de usuario
const validateUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Rol inválido. Valores permitidos: user, admin'),

  handleValidation,
];

// Reglas para cambio de contraseña
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es obligatoria'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),

  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdate,
  validateChangePassword,
};
