import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';

const checkAssignments = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/medidor');
        console.log('✅ Conectado a MongoDB');

        const assignments = await Assignment.find()
            .populate('createdBy', 'nombre apellidoPaterno email')
            .populate('assignedTo', 'nombre apellidoPaterno email')
            .sort({ createdAt: -1 });

        console.log(`📋 Total de asignaciones encontradas: ${assignments.length}`);
        
        assignments.forEach((assignment, index) => {
            console.log(`\n--- Asignación ${index + 1} ---`);
            console.log(`Título: ${assignment.title}`);
            console.log(`Descripción: ${assignment.description}`);
            console.log(`Fecha de entrega: ${assignment.dueDate}`);
            console.log(`Es general: ${assignment.isGeneral ? 'Sí' : 'No'}`);
            console.log(`Creado por: ${assignment.createdBy?.nombre} ${assignment.createdBy?.apellidoPaterno}`);
            console.log(`Asignado a: ${assignment.assignedTo?.length || 0} usuarios`);
            console.log(`Fecha de creación: ${assignment.createdAt}`);
            console.log(`Archivos adjuntos: ${assignment.attachments?.length || 0}`);
        });

        if (assignments.length === 0) {
            console.log('ℹ️ No se encontraron asignaciones. Intenta crear una desde el frontend.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

checkAssignments();
