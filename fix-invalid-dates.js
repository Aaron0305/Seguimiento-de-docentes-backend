import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Verificando y corrigiendo fechas inválidas en asignaciones...');

async function fixInvalidDates() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado a MongoDB');

        // Buscar todas las asignaciones
        const assignments = await Assignment.find({});
        console.log(`📋 Encontradas ${assignments.length} asignaciones`);

        let fixedCount = 0;
        let invalidCount = 0;

        for (const assignment of assignments) {
            let needsUpdate = false;
            const updates = {};

            // Verificar dueDate
            if (!assignment.dueDate || isNaN(new Date(assignment.dueDate).getTime())) {
                console.log(`❌ Fecha de vencimiento inválida en: ${assignment.title}`);
                // Establecer una fecha de vencimiento por defecto (mañana)
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                updates.dueDate = tomorrow;
                needsUpdate = true;
                invalidCount++;
            }

            // Verificar closeDate
            if (!assignment.closeDate || isNaN(new Date(assignment.closeDate).getTime())) {
                console.log(`❌ Fecha de cierre inválida en: ${assignment.title}`);
                // Establecer una fecha de cierre por defecto (3 días desde ahora)
                const threeDaysLater = new Date();
                threeDaysLater.setDate(threeDaysLater.getDate() + 3);
                updates.closeDate = threeDaysLater;
                needsUpdate = true;
                invalidCount++;
            }

            // Si closeDate es anterior a dueDate, corregir
            if (assignment.dueDate && assignment.closeDate) {
                const due = new Date(assignment.dueDate);
                const close = new Date(assignment.closeDate);
                
                if (close < due) {
                    console.log(`⚠️ Fecha de cierre anterior a vencimiento en: ${assignment.title}`);
                    // Hacer que la fecha de cierre sea 2 días después de la fecha de vencimiento
                    const newCloseDate = new Date(due);
                    newCloseDate.setDate(newCloseDate.getDate() + 2);
                    updates.closeDate = newCloseDate;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await Assignment.findByIdAndUpdate(assignment._id, updates);
                console.log(`✅ Corregida asignación: ${assignment.title}`);
                console.log(`   - Nueva fecha de vencimiento: ${updates.dueDate || assignment.dueDate}`);
                console.log(`   - Nueva fecha de cierre: ${updates.closeDate || assignment.closeDate}`);
                fixedCount++;
            }
        }

        console.log('\n📊 Resumen:');
        console.log(`   - Asignaciones revisadas: ${assignments.length}`);
        console.log(`   - Fechas inválidas encontradas: ${invalidCount}`);
        console.log(`   - Asignaciones corregidas: ${fixedCount}`);

        if (fixedCount > 0) {
            console.log('\n✅ Se han corregido las fechas inválidas');
        } else {
            console.log('\n✅ No se encontraron fechas inválidas que corregir');
        }

    } catch (error) {
        console.error('❌ Error al corregir fechas:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

fixInvalidDates();
