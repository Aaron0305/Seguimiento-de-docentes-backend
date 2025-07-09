const express = require('express');
const router = express.Router();
const { getTeacherStats } = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para obtener estadísticas de docentes
// Requiere autenticación y rol de administrador
router.get('/teachers', authMiddleware, getTeacherStats);

module.exports = router; 