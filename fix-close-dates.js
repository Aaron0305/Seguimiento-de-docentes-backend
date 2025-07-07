import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Corrigiendo fechas de cierre anteriores a fechas de vencimiento...');

async function fixCloseDateIssues() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado a MongoDB');

        // Buscar asignaciones donde closeDate < dueDate
        const assignments = await Assignment.find({});
        console.log(`📋 Revisando ${assignments.length} asignaciones...`);

        let fixedCount = 0;

        for (const assignment of assignments) {
            const dueDate = new Date(assignment.dueDate);
            const closeDate = new Date(assignment.closeDate);

            if (closeDate < dueDate) {
                console.log(`⚠️ Corrigiendo: ${assignment.title}`);
                console.log(`   - Fecha de vencimiento: ${dueDate.toLocaleString()}`);
                console.log(`   - Fecha de cierre anterior: ${closeDate.toLocaleString()}`);
                
                // Hacer que la fecha de cierre sea 1 día después de la fecha de vencimiento
                const newCloseDate = new Date(dueDate);
                newCloseDate.setDate(newCloseDate.getDate() + 1);
                
                await Assignment.findByIdAndUpdate(assignment._id, {
                    closeDate: newCloseDate
                });
                
                console.log(`   - Nueva fecha de cierre: ${newCloseDate.toLocaleString()}`);
                fixedCount++;
            }
        }

        console.log('\n📊 Resumen:');
        console.log(`   - Asignaciones revisadas: ${assignments.length}`);
        console.log(`   - Fechas de cierre corregidas: ${fixedCount}`);

        if (fixedCount > 0) {
            console.log('\n✅ Se han corregido las fechas de cierre problemáticas');
        } else {
            console.log('\n✅ No se encontraron fechas de cierre que corregir');
        }

    } catch (error) {
        console.error('❌ Error al corregir fechas:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

fixCloseDateIssues();
