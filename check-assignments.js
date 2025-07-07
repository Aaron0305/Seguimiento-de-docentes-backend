import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/seguimiento-docentes');
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

const checkAssignments = async () => {
    try {
        console.log('🔍 Verificando asignaciones...');
        
        // Obtener todas las asignaciones ordenadas por fecha de creación (más recientes primero)
        const assignments = await Assignment.find().sort({ createdAt: -1 }).limit(10).lean();
        console.log(`📊 Total de asignaciones (últimas 10): ${assignments.length}`);
        
        if (assignments.length > 0) {
            console.log('\n📋 Listado de asignaciones:');
            assignments.forEach((assignment, index) => {
                console.log(`\n${index + 1}. ${assignment.title}`);
                console.log(`   ID: ${assignment._id}`);
                console.log(`   Due Date: ${assignment.dueDate}`);
                console.log(`   Close Date: ${assignment.closeDate || 'NO DEFINIDO'}`);
                console.log(`   Created At: ${assignment.createdAt}`);
                console.log(`   Is General: ${assignment.isGeneral}`);
                console.log(`   Status: ${assignment.status}`);
            });
            
            // Verificar específicamente las que tienen closeDate
            const withCloseDate = assignments.filter(a => a.closeDate);
            const withoutCloseDate = assignments.filter(a => !a.closeDate);
            
            console.log(`\n📈 Estadísticas:`);
            console.log(`   Con closeDate: ${withCloseDate.length}`);
            console.log(`   Sin closeDate: ${withoutCloseDate.length}`);
            
            if (withCloseDate.length > 0) {
                console.log('\n✅ Asignaciones con closeDate:');
                withCloseDate.forEach(a => {
                    console.log(`   - ${a.title}: ${a.closeDate}`);
                });
            }
            
            if (withoutCloseDate.length > 0) {
                console.log('\n⚠️  Asignaciones sin closeDate:');
                withoutCloseDate.forEach(a => {
                    console.log(`   - ${a.title}: creada el ${a.createdAt}`);
                });
            }
        } else {
            console.log('📭 No hay asignaciones en la base de datos');
        }
        
    } catch (error) {
        console.error('❌ Error al verificar asignaciones:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n📤 Desconectado de MongoDB');
    }
};

// Ejecutar la verificación
connectDB().then(() => {
    checkAssignments();
});
