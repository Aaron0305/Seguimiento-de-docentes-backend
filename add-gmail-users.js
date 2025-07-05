import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar modelos
import User from './models/User.js';
import Carrera from './models/Carrera.js';

/**
 * Script para agregar usuarios con emails de Gmail
 */

async function addGmailUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medidor');
    console.log('✅ Conectado a MongoDB');

    // Obtener una carrera aleatoria
    const carreras = await Carrera.find({ activo: true });
    if (carreras.length === 0) {
      throw new Error('No hay carreras disponibles en la base de datos');
    }

    // Encriptar la contraseña
    const password = '1234567890';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Usuarios a agregar
    const usersToAdd = [
      {
        email: 'prodiggigameplays@gmail.com',
        numeroControl: '2024001001',
        nombre: 'CARLOS',
        apellidoPaterno: 'RODRIGUEZ',
        apellidoMaterno: 'MARTINEZ',
        carrera: carreras[Math.floor(Math.random() * carreras.length)]._id,
        semestre: Math.floor(Math.random() * 9) + 1, // Semestre 1-9
        password: hashedPassword,
        fotoPerfil: null,
        createdAt: new Date()
      },
      {
        email: 'takeshikun46@gmail.com',
        numeroControl: '2024001002',
        nombre: 'MIGUEL',
        apellidoPaterno: 'TAKESHI',
        apellidoMaterno: 'YAMAMOTO',
        carrera: carreras[Math.floor(Math.random() * carreras.length)]._id,
        semestre: Math.floor(Math.random() * 9) + 1, // Semestre 1-9
        password: hashedPassword,
        fotoPerfil: null,
        createdAt: new Date()
      },
      {
        email: 'ryaaron000@gmail.com',
        numeroControl: '2024001003',
        nombre: 'AARON',
        apellidoPaterno: 'RAMIREZ',
        apellidoMaterno: 'GUTIERREZ',
        carrera: carreras[Math.floor(Math.random() * carreras.length)]._id,
        semestre: Math.floor(Math.random() * 9) + 1, // Semestre 1-9
        password: hashedPassword,
        fotoPerfil: null,
        createdAt: new Date()
      }
    ];

    // Verificar si los usuarios ya existen
    for (const userData of usersToAdd) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️ El usuario ${userData.email} ya existe en la base de datos`);
        continue;
      }

      // Verificar si el número de control ya existe
      const existingNumero = await User.findOne({ numeroControl: userData.numeroControl });
      if (existingNumero) {
        // Generar un nuevo número de control único
        userData.numeroControl = `2024${Date.now().toString().slice(-6)}`;
      }

      // Insertar usuario
      const newUser = new User(userData);
      await newUser.save();
      
      console.log(`✅ Usuario agregado exitosamente:`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   🆔 Número de Control: ${userData.numeroControl}`);
      console.log(`   👤 Nombre: ${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`);
      console.log(`   🎓 Carrera: ${(await Carrera.findById(userData.carrera)).nombre}`);
      console.log(`   📚 Semestre: ${userData.semestre}`);
      console.log(`   🔐 Contraseña: ${password}`);
      console.log('');
    }

    console.log('🎉 Proceso completado');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
addGmailUsers();
