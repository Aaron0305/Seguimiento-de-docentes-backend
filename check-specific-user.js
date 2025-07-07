import mongoose from 'mongoose';
import User from './models/User.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medidor';

console.log('🔍 Verificando usuario específico para login...\n');

try {
    console.log('✅ Conectando a MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar el usuario específico
    const user = await User.findOne({ email: 'profesor@test.com' });
    
    if (user) {
        console.log('👤 Usuario encontrado:');
        console.log(`   ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nombre: ${user.nombre} ${user.apellidoPaterno}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Numero Control: ${user.numeroControl}`);
        
        // Ver el objeto completo como JSON
        console.log('\n📋 Objeto usuario completo (JSON):');
        console.log(JSON.stringify({
            _id: user._id,
            email: user.email,
            nombre: user.nombre,
            apellidoPaterno: user.apellidoPaterno,
            apellidoMaterno: user.apellidoMaterno,
            role: user.role,
            numeroControl: user.numeroControl
        }, null, 2));
        
    } else {
        console.log('❌ Usuario no encontrado con email: profesor@test.com');
        
        // Buscar todos los usuarios con "profesor" en el nombre o email
        console.log('\n🔍 Buscando usuarios similares...');
        const similarUsers = await User.find({
            $or: [
                { email: { $regex: 'profesor', $options: 'i' } },
                { nombre: { $regex: 'profesor', $options: 'i' } }
            ]
        });
        
        console.log(`📋 Usuarios similares encontrados: ${similarUsers.length}`);
        similarUsers.forEach((u, i) => {
            console.log(`   ${i+1}. ${u.nombre} - ${u.email} - Rol: ${u.role}`);
        });
    }

} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    console.log('\n🔌 Desconectando de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Desconectado');
}
