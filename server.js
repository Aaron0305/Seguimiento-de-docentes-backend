import { app, httpServer } from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

// Iniciar el servidor HTTP (que incluye Socket.IO)
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});