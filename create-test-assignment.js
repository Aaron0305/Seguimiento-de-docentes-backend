import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';
import User from './models/User.js';

const createTestAssignment = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/medidor');
        console.log('✅ Conectado a MongoDB');

        // Buscar el usuario admin
        const adminUser = await User.findOne({ email: 'admin@test.com' });
        if (!adminUser) {
            console.log('❌ Usuario admin no encontrado');
            return;
        }

        // Buscar todos los docentes
        const docentes = await User.find({ role: 'docente' });
        console.log(`📋 Docentes encontrados: ${docentes.length}`);

        // Crear asignación directamente
        const assignment = new Assignment({
            title: 'PRUEBA - Entrega de planeaciones de inicio de semestre',
            description: 'Los docentes deben entregar sus planeaciones antes de la fecha establecida',
            dueDate: new Date('2025-07-31'),
            isGeneral: true,
            createdBy: adminUser._id,
            assignedTo: docentes.map(d => d._id),
            status: 'pending'
        });

        const savedAssignment = await assignment.save();
        console.log('✅ ¡ASIGNACIÓN GUARDADA EN LA BASE DE DATOS!');
        console.log('📝 ID:', savedAssignment._id);
        console.log('📝 Título:', savedAssignment.title);
        console.log('👥 Asignada a:', savedAssignment.assignedTo.length, 'usuarios');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

createTestAssignment();
