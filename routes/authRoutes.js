import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { uploadProfile } from '../middleware/profileUploadMiddleware.js';

const router = express.Router();

// Ruta de registro
router.post('/register', uploadProfile, async (req, res) => {  try {
    const { 
      email, 
      password, 
      numeroControl, 
      nombre, 
      apellidoPaterno, 
      apellidoMaterno, 
      carrera, 
      semestre 
    } = req.body;

    // Guardar el nombre del archivo de la foto si se subió una
    const fotoPerfil = req.file ? req.file.filename : null;

    const userExists = await User.findOne({
      $or: [{ email }, { numeroControl }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email 
          ? 'Este correo electrónico ya está registrado' 
          : 'Este número de control ya está registrado'
      });
    }    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      numeroControl,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      carrera,
      semestre,
      fotoPerfil
    });

    const savedUser = await user.save();
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || 'tu_jwt_secret',
      { expiresIn: '24h' }
    );

    const userResponse = {
      _id: savedUser._id,
      email: savedUser.email,
      numeroControl: savedUser.numeroControl,
      nombre: savedUser.nombre,
      apellidoPaterno: savedUser.apellidoPaterno,
      apellidoMaterno: savedUser.apellidoMaterno,
      carrera: savedUser.carrera,
      semestre: savedUser.semestre,
      fotoPerfil: savedUser.fotoPerfil
    };

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('carrera', 'nombre');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Correo o contraseña incorrectos'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Correo o contraseña incorrectos'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'tu_jwt_secret',
      { expiresIn: '24h' }
    );

    const userResponse = {
      _id: user._id,
      email: user.email,
      numeroControl: user.numeroControl,
      nombre: user.nombre,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno,
      carrera: user.carrera,
      semestre: user.semestre
    };

    res.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

// Ruta para verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret');
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('carrera', 'nombre');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

export default router;