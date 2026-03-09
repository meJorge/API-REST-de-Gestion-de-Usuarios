const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.mjs');

/**
 * Genera un token JWT firmado con los datos del usuario
 * @param {Object} payload - { id, email, role }
 * @returns {string} token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token
 * @returns {Object} payload decodificado
 */
const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret);
};

module.exports = { generateToken, verifyToken };
