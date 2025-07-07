import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Probando directamente el modelo Assignment...');

async function testAssignmentModel() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado a MongoDB');

        // Buscar una asignación específica
        const assignment = await Assignment.findOne({ status: 'completed' });
        
        if (assignment) {
            console.log('📋 Asignación encontrada:');
            console.log('   - ID:', assignment._id);
            console.log('   - Título:', assignment.title);
            console.log('   - Estado:', assignment.status);
            console.log('   - CompletedAt:', assignment.completedAt);
            console.log('   - Estructura completa:', JSON.stringify(assignment, null, 2));
            
            // Intentar actualizar manualmente
            console.log('\n🔄 Actualizando manualmente...');
            assignment.completedAt = new Date();
            await assignment.save();
            
            console.log('✅ Actualización guardada');
            console.log('   - Nuevo completedAt:', assignment.completedAt);
        } else {
            console.log('❌ No se encontraron asignaciones completadas');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

testAssignmentModel();
