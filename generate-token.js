import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

const generateFreshToken = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/medidor');
        console.log('✅ Conectado a MongoDB');

        // Buscar el usuario admin
        const adminUser = await User.findOne({ email: 'admin@test.com' });
        if (!adminUser) {
            console.log('❌ Usuario admin no encontrado');
            return;
        }

        // Generar nuevo token
        const token = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET || 'tu_jwt_secret',
            { expiresIn: '7d' }
        );

        console.log('✅ Usuario admin encontrado:', adminUser.email);
        console.log('🔑 Nuevo token generado:');
        console.log(token);
        console.log('\n📋 Para usar en el navegador:');
        console.log('1. Abre las DevTools (F12)');
        console.log('2. Ve a Console');
        console.log('3. Ejecuta: localStorage.setItem("token", "' + token + '")');
        console.log('4. Ejecuta: localStorage.setItem("user", \'{"_id":"' + adminUser._id + '","email":"' + adminUser.email + '","role":"admin"}\')');
        console.log('5. Recarga la página');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

generateFreshToken();
