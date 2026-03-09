import { find, findOne, findByIdAndUpdate } from '../models/User.mjs';


export const getAllUsers = async (req, res) => {
  try {
    const users = await find({ active: true }).select('-password');
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Un usuario regular solo puede verse a sí mismo
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'No tienes permisos para ver este usuario' });
    }

    const user = await findOne({ _id: id, active: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario', details: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Un usuario regular solo puede editarse a sí mismo y no puede cambiar su rol
    if (req.user.role !== 'admin') {
      if (req.user._id.toString() !== id) {
        return res.status(403).json({ error: 'No puedes editar a otro usuario' });
      }
      if (role) {
        return res.status(403).json({ error: 'No tienes permisos para cambiar roles' });
      }
    }

    // Verificar email duplicado si se intenta cambiar
    if (email) {
      const emailExists = await findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && req.user.role === 'admin') updateData.role = role;

    const user = await findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado exitosamente', user });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar que un admin se elimine a sí mismo
    if (req.user._id.toString() === id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const user = await findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
  }
};