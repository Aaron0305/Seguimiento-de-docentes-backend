import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';

const createAdminUser = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb://localhost:27017/medidor');
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existe un usuario admin
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('ℹ️ Ya existe un usuario administrador:', existingAdmin.email);
            return;
        }

        // Crear usuario administrador
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = new User({
            email: 'admin@test.com',
            password: hashedPassword,
            numeroControl: 'ADMIN001',
            nombre: 'Administrador',
            apellidoPaterno: 'Sistema',
            apellidoMaterno: 'Test',
            role: 'admin',
            carrera: '6835f84d797e8dda20f1cd5d', // Ingeniería en Sistemas Computacionales
            semestre: 1
        });

        const savedUser = await adminUser.save();
        console.log('✅ Usuario administrador creado exitosamente:', savedUser.email);
        console.log('📧 Email:', savedUser.email);
        console.log('🔑 Password: admin123');
        console.log('👤 Role:', savedUser.role);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

createAdminUser();
