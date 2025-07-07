import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';
import User from './models/User.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medidor';

console.log('🔍 Verificando información del creador de asignaciones...\n');

try {
    console.log('✅ Conectando a MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar asignaciones con sus creadores
    const assignments = await Assignment.find()
        .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno role email')
        .sort('-createdAt')
        .limit(5);

    console.log(`📋 Total de asignaciones encontradas: ${assignments.length}\n`);

    assignments.forEach((assignment, index) => {
        console.log(`${index + 1}. ${assignment.title}`);
        console.log(`   ID: ${assignment._id}`);
        console.log(`   Creado por ID: ${assignment.createdBy?._id || 'Sin ID'}`);
        console.log(`   Creado por nombre: ${assignment.createdBy?.nombre || 'Sin nombre'} ${assignment.createdBy?.apellidoPaterno || ''}`);
        console.log(`   Email creador: ${assignment.createdBy?.email || 'Sin email'}`);
        console.log(`   Rol creador: ${assignment.createdBy?.role || 'Sin rol'}`);
        console.log(`   Status: ${assignment.status}`);
        console.log(`   Fecha creación: ${assignment.createdAt}`);
        console.log(`   Due Date: ${assignment.dueDate}`);
        console.log(`   Close Date: ${assignment.closeDate}`);
        console.log('   ---');
    });

    // También buscar asignaciones específicas que aparecen en el test
    console.log('\n🔍 Buscando asignaciones con título "PRUEBA"...');
    const pruebaAssignments = await Assignment.find({
        title: { $regex: 'PRUEBA', $options: 'i' }
    })
    .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno role email')
    .sort('-createdAt');

    console.log(`📋 Asignaciones con "PRUEBA": ${pruebaAssignments.length}\n`);

    pruebaAssignments.forEach((assignment, index) => {
        console.log(`${index + 1}. ${assignment.title}`);
        console.log(`   ID: ${assignment._id}`);
        console.log(`   Creado por: ${assignment.createdBy?.nombre || 'Sin nombre'} ${assignment.createdBy?.apellidoPaterno || ''}`);
        console.log(`   Email: ${assignment.createdBy?.email || 'Sin email'}`);
        console.log(`   Rol: ${assignment.createdBy?.role || 'Sin rol'}`);
        console.log(`   Status: ${assignment.status}`);
        console.log('   ---');
    });

} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    console.log('\n🔌 Desconectando de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Desconectado');
}
