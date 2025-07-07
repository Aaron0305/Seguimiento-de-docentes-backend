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

const testDirectAssignmentCreation = async () => {
    try {
        console.log('🧪 Testing direct assignment creation...');
        
        // Crear una asignación directamente en la base de datos
        const now = new Date();
        const dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        const closeDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        
        console.log('📅 Fechas:');
        console.log(`   Due Date: ${dueDate.toISOString()}`);
        console.log(`   Close Date: ${closeDate.toISOString()}`);
        
        const assignmentData = {
            title: 'Direct Test Assignment',
            description: 'Testing direct creation with closeDate',
            dueDate: dueDate,
            closeDate: closeDate,
            isGeneral: true,
            createdBy: new mongoose.Types.ObjectId('686adb66894909cadb9449bf'),
            assignedTo: [new mongoose.Types.ObjectId('6835f947797e8dda20f1cd84')],
            status: 'pending'
        };
        
        console.log('📝 Creando asignación...');
        const assignment = new Assignment(assignmentData);
        
        console.log('💾 Guardando en base de datos...');
        const savedAssignment = await assignment.save();
        
        console.log('✅ Asignación creada con ID:', savedAssignment._id);
        console.log('📋 Datos guardados:', {
            title: savedAssignment.title,
            dueDate: savedAssignment.dueDate,
            closeDate: savedAssignment.closeDate,
            isGeneral: savedAssignment.isGeneral
        });
        
        // Verificar que se guardó correctamente
        const foundAssignment = await Assignment.findById(savedAssignment._id).lean();
        console.log('🔍 Verificación desde DB:', {
            title: foundAssignment.title,
            dueDate: foundAssignment.dueDate,
            closeDate: foundAssignment.closeDate,
            isGeneral: foundAssignment.isGeneral
        });
        
        if (foundAssignment.closeDate) {
            console.log('✅ SUCCESS: closeDate se guardó correctamente');
        } else {
            console.log('❌ FAIL: closeDate no se guardó');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        if (error.errors) {
            console.error('📝 Validation errors:', error.errors);
        }
    } finally {
        await mongoose.disconnect();
        console.log('📤 Desconectado de MongoDB');
    }
};

// Ejecutar la prueba
connectDB().then(() => {
    testDirectAssignmentCreation();
});
