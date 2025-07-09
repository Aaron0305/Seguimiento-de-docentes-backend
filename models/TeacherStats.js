import mongoose from 'mongoose';

const teacherStatsSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    stats: {
        completed: {
            type: Number,
            default: 0
        },
        pending: {
            type: Number,
            default: 0
        },
        overdue: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Método para actualizar las estadísticas
teacherStatsSchema.statics.updateTeacherStats = async function(teacherId) {
    const Assignment = mongoose.model('Assignment');
    
    // Obtener todas las asignaciones del profesor
    const assignments = await Assignment.find({
        assignedTo: teacherId
    });

    // Inicializar contadores
    let stats = {
        completed: 0,
        pending: 0,
        overdue: 0,
        total: assignments.length
    };

    // Calcular estadísticas
    const now = new Date();
    assignments.forEach(assignment => {
        if (assignment.status === 'completed') {
            stats.completed++;
        } else {
            if (now > assignment.dueDate) {
                stats.overdue++;
            } else {
                stats.pending++;
            }
        }
    });

    // Actualizar o crear estadísticas del profesor
    await this.findOneAndUpdate(
        { teacher: teacherId },
        { 
            stats,
            lastUpdated: now
        },
        { upsert: true, new: true }
    );
};

export default mongoose.model('TeacherStats', teacherStatsSchema); 