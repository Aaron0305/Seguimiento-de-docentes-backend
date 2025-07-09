import mongoose from 'mongoose';

const teacherStatsSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    },
    __v: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('TeacherStats', teacherStatsSchema); 