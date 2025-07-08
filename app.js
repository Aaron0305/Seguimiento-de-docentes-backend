import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/authRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import dailyRecordRoutes from './routes/dailyRecordRoutes.js';
import carrerasRoutes from './routes/carreras.js';
import semestresRoutes from './routes/semestres.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Crear servidor HTTP
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Almacenar las conexiones de socket de los usuarios
const userSockets = new Map();

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('authenticate', (userId) => {
    console.log('Usuario autenticado:', userId);
    userSockets.set(userId, socket);
    
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', userId);
      userSockets.delete(userId);
    });
  });
});

// Exportar función para enviar notificaciones
export const sendNotification = (userId, notification) => {
  const userSocket = userSockets.get(userId);
  if (userSocket) {
    console.log('Enviando notificación a usuario:', userId);
    userSocket.emit('notification', notification);
  } else {
    console.log('Usuario no conectado:', userId);
  }
};

// Configurar CORS específicamente
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/daily-records', dailyRecordRoutes);
app.use('/api/carreras', carrerasRoutes);
app.use('/api/semestres', semestresRoutes);

// Manejo de errores
app.use(errorHandler);

export { app, httpServer };