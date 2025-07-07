import mongoose from 'mongoose';
import User from './models/User.js';

async function checkUserRoleField() {
    try {
        await mongoose.connect('mongodb://localhost:27017/seguimiento-docentes');
        console.log('✅ Conectado a MongoDB');

        // Buscar cualquier usuario
        const anyUser = await User.findOne({});
        
        if (anyUser) {
            console.log('\n👤 Usuario encontrado:');
            console.log('📧 Email:', anyUser.email);
            console.log('📛 Nombre:', anyUser.nombre, anyUser.apellidoPaterno);
            console.log('🔑 Campos disponibles:', Object.keys(anyUser.toObject()));
            
            // Verificar específicamente el campo de rol
            console.log('👔 role:', anyUser.role);
            console.log('🎭 rol:', anyUser.rol);
            
            console.log('\n📄 Documento completo (primeros campos):');
            const userObj = anyUser.toObject();
            Object.keys(userObj).forEach(key => {
                if (!['password'].includes(key)) {
                    console.log(`   ${key}:`, userObj[key]);
                }
            });
        } else {
            console.log('❌ No se encontraron usuarios');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

checkUserRoleField();
