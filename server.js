import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadConfig } from './config/upload.js';
import userRoutes from './routes/users.js';
import { router as carrerasRouter } from './routes/carreras.js';
import dailyRecordRoutes from './routes/dailyRecordRoutes.js';
import authRoutes from './routes/authRoutes.js';
import semestresRoutes from './routes/semestres.js';
import Semestre from './models/Semestre.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Asegurar que existan los directorios de uploads
uploadConfig.createUploadDirs();

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// Configuración CORS unificada
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Configuraciones básicas
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/evidencias', express.static(path.join(__dirname, 'uploads/evidencias')));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/carreras', carrerasRouter);
app.use('/api/records', dailyRecordRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/semestres', semestresRoutes);

// Función para inicializar semestres
async function initializeSemestres() {
    try {
        const count = await Semestre.countDocuments();
        if (count === 0) {
            const semestres = [];
            for (let i = 1; i <= 9; i++) {
                semestres.push({
                    numero: i,
                    descripcion: `${i}º Semestre`
                });
            }
            await Semestre.insertMany(semestres);
            console.log('Semestres inicializados correctamente');
        } else {
            console.log('Los semestres ya están inicializados');
        }
    } catch (error) {
        console.error('Error al inicializar semestres:', error);
    }
}

// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medidor')
  .then(async () => {
    console.log('Conectado a MongoDB');
    // Inicializar semestres después de conectar a la base de datos
    await initializeSemestres();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});