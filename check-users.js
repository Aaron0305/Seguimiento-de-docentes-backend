import mongoose from 'mongoose';
import User from './models/User.js';

const checkUsers = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/medidor');
        console.log('✅ Conectado a MongoDB');

        const users = await User.find().select('email nombre apellidoPaterno role');
        
        console.log(`📋 Total de usuarios encontrados: ${users.length}`);
        
        const roleCount = {};
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.nombre} ${user.apellidoPaterno} - ${user.email} - Rol: ${user.role || 'NO DEFINIDO'}`);
            const role = user.role || 'NO DEFINIDO';
            roleCount[role] = (roleCount[role] || 0) + 1;
        });

        console.log('\n📊 Resumen por roles:');
        Object.entries(roleCount).forEach(([role, count]) => {
            console.log(`  - ${role}: ${count} usuarios`);
        });

        const docentes = await User.find({ role: 'docente' });
        console.log(`\n👨‍🏫 Usuarios con rol 'docente': ${docentes.length}`);

        if (docentes.length === 0) {
            console.log('\n⚠️ PROBLEMA IDENTIFICADO: No hay usuarios con rol "docente"');
            console.log('💡 Solución: Actualizar los roles de los usuarios');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

checkUsers();
