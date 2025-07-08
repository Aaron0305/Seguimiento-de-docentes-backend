import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/users.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import dailyRecordRoutes from './routes/dailyRecordRoutes.js';
import carrerasRoutes from './routes/carreras.js';
import semestresRoutes from './routes/semestres.js';
import errorHandler from './middleware/errorHandler.js';
import notificationService from './services/notificationService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Inicializar servicio de notificaciones
notificationService.initialize(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas estáticas
app.use('/uploads', express.static('uploads'));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/daily-records', dailyRecordRoutes);
app.use('/api/carreras', carrerasRoutes);
app.use('/api/semestres', semestresRoutes);

// Manejador de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al conectar a la base de datos:', err);
  process.exit(1);
});