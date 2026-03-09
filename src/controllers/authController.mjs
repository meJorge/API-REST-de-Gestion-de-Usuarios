import { findOne, create, findById } from '../models/User.mjs';
import { hashPassword, comparePassword } from '../utils/hashPassword.mjs';
import { generateToken } from '../utils/generateToken.mjs';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await create({
      name,
      email,
      password: hashedPassword,
    });

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findOne({ email, active: true }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

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

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Solo el propio usuario puede cambiar su contraseña
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'No puedes cambiar la contraseña de otro usuario' });
    }

    // Obtener usuario con password
    const user = await findById(userId).select('+password');
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