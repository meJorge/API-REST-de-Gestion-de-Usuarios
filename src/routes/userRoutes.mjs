const router = require('express').Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController.mjs').default;
const { changePassword } = require('../controllers/authController.mjs').default;
const authenticate = require('../middlewares/auth.mjs').default;
const authorize = require('../middlewares/authorize.mjs');
const { validateUpdate, validateChangePassword } = require('../middlewares/validate.mjs');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/users         → Solo admin
router.get('/', authorize('admin'), getAllUsers);

// GET /api/users/:id     → Admin o el propio usuario
router.get('/:id', getUserById);

// PUT /api/users/:id     → Admin o el propio usuario7
router.put('/:id', validateUpdate, updateUser);

// DELETE /api/users/:id  → Solo admin
router.delete('/:id', authorize('admin'), deleteUser);

// PUT /api/users/:id/password → Solo el propio usuario
router.put('/:id/password', validateChangePassword, changePassword);

module.exports = router;