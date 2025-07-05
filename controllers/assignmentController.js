const Assignment = require('../models/Assignment');
const User = require('../models/User');

// Crear una nueva asignación
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, isGeneral, assignedTo } = req.body;
        
        const assignment = new Assignment({
            title,
            description,
            dueDate,
            isGeneral,
            createdBy: req.user._id,
            assignedTo: isGeneral ? [] : assignedTo
        });

        if (req.files) {
            assignment.attachments = req.files.map(file => ({
                fileName: file.originalname,
                fileUrl: file.path
            }));
        }

        await assignment.save();

        // Si es una asignación general, asignar a todos los usuarios con rol "docente"
        if (isGeneral) {
            const teachers = await User.find({ role: 'docente' }).select('_id');
            assignment.assignedTo = teachers.map(teacher => teacher._id);
            await assignment.save();
        }

        res.status(201).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Obtener todas las asignaciones (para admin)
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate('assignedTo', 'nombreCompleto email')
            .populate('createdBy', 'nombreCompleto')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Obtener asignaciones de un usuario específico
exports.getUserAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            assignedTo: req.user._id
        })
        .populate('createdBy', 'nombreCompleto')
        .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Subir respuesta a una asignación
exports.submitAssignmentResponse = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Asignación no encontrada'
            });
        }

        if (!assignment.assignedTo.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para responder a esta asignación'
            });
        }

        const response = {
            user: req.user._id,
            files: req.files.map(file => ({
                fileName: file.originalname,
                fileUrl: file.path
            }))
        };

        assignment.responses.push(response);
        await assignment.save();

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Actualizar estado de una asignación
exports.updateAssignmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Asignación no encontrada'
            });
        }

        assignment.status = status;
        await assignment.save();

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 