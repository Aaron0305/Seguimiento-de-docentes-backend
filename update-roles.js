import mongoose from 'mongoose';
import User from './models/User.js';

const updateUserRoles = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/medidor');
        console.log('✅ Conectado a MongoDB');

        // Actualizar el usuario admin
        const adminResult = await User.updateOne(
            { email: 'admin@test.com' },
            { $set: { role: 'admin' } }
        );
        console.log(`👑 Admin actualizado: ${adminResult.modifiedCount} usuario`);

        // Actualizar todos los demás usuarios a docentes (excluyendo el admin)
        const docentesResult = await User.updateMany(
            { email: { $ne: 'admin@test.com' } },
            { $set: { role: 'docente' } }
        );
        console.log(`👨‍🏫 Docentes actualizados: ${docentesResult.modifiedCount} usuarios`);

        // Verificar los cambios
        const users = await User.find().select('email nombre apellidoPaterno role');
        
        console.log('\n📋 Usuarios después de la actualización:');
        const roleCount = {};
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.nombre} ${user.apellidoPaterno} - ${user.email} - Rol: ${user.role}`);
            const role = user.role || 'NO DEFINIDO';
            roleCount[role] = (roleCount[role] || 0) + 1;
        });

        console.log('\n📊 Resumen final por roles:');
        Object.entries(roleCount).forEach(([role, count]) => {
            console.log(`  - ${role}: ${count} usuarios`);
        });

        console.log('\n✅ ¡Roles actualizados correctamente!');
        console.log('🎯 Ahora las asignaciones deberían funcionar correctamente');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

updateUserRoles();
