const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/generateToken');

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generar token
    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', details: error.message });
  }
};

/**
 * POST /api/auth/login
 * Inicia sesión y devuelve un token JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario (incluir password que está excluido por defecto)
    const user = await User.findOne({ email, active: true }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    res.json({
      message: 'Sesión iniciada exitosamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', details: error.message });
  }
};

/**
 * PUT /api/users/:id/password
 * Cambia la contraseña del usuario autenticado
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Solo el propio usuario puede cambiar su contraseña
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'No puedes cambiar la contraseña de otro usuario' });
    }

    // Obtener usuario con password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Hashear y guardar nueva contraseña
    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar contraseña', details: error.message });
  }
};

module.exports = { register, login, changePassword };
