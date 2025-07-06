const Assignment = require('../models/Assignment');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Crear una nueva asignación
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, isGeneral } = req.body;
        let assignedTo = req.body['assignedTo[]'] || req.body.assignedTo;

        // Validar datos requeridos
        if (!title || !description || !dueDate) {
            // Si hay archivos subidos, eliminarlos ya que hubo un error
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }

        // Crear la asignación base
        const assignment = new Assignment({
            title: title.trim(),
            description: description.trim(),
            dueDate: new Date(dueDate),
            isGeneral: isGeneral === 'true' || isGeneral === true,
            createdBy: req.user._id,
            status: 'pending'
        });

        // Manejar archivos adjuntos si existen
        if (req.files && req.files.length > 0) {
            assignment.attachments = req.files.map(file => ({
                fileName: file.originalname,
                fileUrl: file.path.replace(/\\/g, '/'),
                uploadedAt: new Date()
            }));
        }

        // Si es una asignación general, asignar a todos los docentes
        if (assignment.isGeneral) {
            const teachers = await User.find({ role: 'docente' }).select('_id');
            if (!teachers || teachers.length === 0) {
                throw new Error('No se encontraron docentes para asignar');
            }
            assignment.assignedTo = teachers.map(teacher => teacher._id);
        } else {
            // Si no es general, usar los IDs proporcionados
            if (!assignedTo || (Array.isArray(assignedTo) && assignedTo.length === 0)) {
                throw new Error('Debe seleccionar al menos un docente para asignaciones individuales');
            }

            // Asegurarse de que assignedTo sea un array
            if (!Array.isArray(assignedTo)) {
                assignedTo = [assignedTo];
            }

            // Verificar que todos los usuarios asignados existan y sean docentes
            const users = await User.find({
                _id: { $in: assignedTo },
                role: 'docente'
            }).select('_id');

            if (!users || users.length !== assignedTo.length) {
                throw new Error('Uno o más usuarios seleccionados no son válidos o no son docentes');
            }

            assignment.assignedTo = users.map(user => user._id);
        }

        // Guardar la asignación
        await assignment.save();

        // Poblar los datos de los usuarios asignados para la respuesta
        const populatedAssignment = await Assignment.findById(assignment._id)
            .populate('assignedTo', 'nombre apellidoPaterno apellidoMaterno email')
            .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno');

        res.status(201).json({
            success: true,
            message: 'Asignación creada exitosamente',
            data: populatedAssignment
        });
    } catch (error) {
        // Si hay archivos subidos, eliminarlos ya que hubo un error
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        console.error('Error al crear asignación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al crear la asignación'
        });
    }
};

// Obtener todas las asignaciones (para admin)
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate('assignedTo', 'nombre apellidoPaterno apellidoMaterno email')
            .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        console.error('Error al obtener asignaciones:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las asignaciones'
        });
    }
};

// Obtener asignaciones de un usuario específico
exports.getUserAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            assignedTo: req.user._id
        })
        .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno')
        .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        console.error('Error al obtener asignaciones del usuario:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las asignaciones'
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

        // Verificar que el usuario esté asignado a esta tarea
        if (!assignment.assignedTo.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para responder a esta asignación'
            });
        }

        const response = {
            user: req.user._id,
            files: req.files ? req.files.map(file => ({
                fileName: file.originalname,
                fileUrl: file.path
            })) : []
        };

        // Evitar respuestas duplicadas del mismo usuario
        const existingResponseIndex = assignment.responses.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );

        if (existingResponseIndex !== -1) {
            assignment.responses[existingResponseIndex] = response;
        } else {
            assignment.responses.push(response);
        }

        await assignment.save();

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error('Error al subir respuesta:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al subir la respuesta'
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
        console.error('Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al actualizar el estado'
        });
    }
}; 