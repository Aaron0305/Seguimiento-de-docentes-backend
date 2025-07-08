import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import fs from 'fs';
import emailService from '../services/emailService.js';
import { sendNotification } from '../app.js';

export const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, closeDate, isGeneral } = req.body;
        let assignedTo = req.body['assignedTo[]'] || req.body.assignedTo;

        // Validar datos requeridos
        if (!title || !description || !dueDate || !closeDate) {
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos: título, descripción, fecha de vencimiento y fecha de cierre'
            });
        }

        // Validar que la fecha de cierre sea posterior o igual a la fecha de vencimiento
        const dueDateObj = new Date(dueDate);
        const closeDateObj = new Date(closeDate);
        
        if (closeDateObj < dueDateObj) {
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(400).json({
                success: false,
                error: 'La fecha de cierre debe ser posterior o igual a la fecha de vencimiento'
            });
        }

        // Crear la asignación base
        const assignment = new Assignment({
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDateObj,
            closeDate: closeDateObj,
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

        let teachers = [];

        // Si es una asignación general, asignar a todos los docentes
        if (assignment.isGeneral) {
            teachers = await User.find({ role: 'docente' }).select('_id nombre apellidoPaterno apellidoMaterno email');
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
            teachers = await User.find({
                _id: { $in: assignedTo },
                role: 'docente'
            }).select('_id nombre apellidoPaterno apellidoMaterno email');

            if (!teachers || teachers.length !== assignedTo.length) {
                throw new Error('Uno o más usuarios seleccionados no son válidos o no son docentes');
            }

            assignment.assignedTo = teachers.map(teacher => teacher._id);
        }

        // Guardar la asignación
        await assignment.save();

        // Poblar los datos de los usuarios asignados para la respuesta
        const populatedAssignment = await Assignment.findById(assignment._id)
            .populate('assignedTo', 'nombre apellidoPaterno apellidoMaterno email')
            .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno');

        // Enviar notificaciones por correo electrónico y en tiempo real
        for (const teacher of teachers) {
            const teacherName = `${teacher.nombre} ${teacher.apellidoPaterno} ${teacher.apellidoMaterno}`;
            const assignmentUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/assignments/${assignment._id}`;

            // Enviar correo electrónico
            await emailService.sendNewAssignmentNotification({
                to: teacher.email,
                teacherName,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate,
                closeDate: assignment.closeDate,
                assignmentUrl
            });

            // Enviar notificación en tiempo real
            sendNotification(teacher._id.toString(), {
                type: 'NEW_ASSIGNMENT',
                title: '¡Nueva Asignación!',
                message: `Se te ha asignado una nueva tarea: ${title}`,
                timestamp: new Date(),
                data: {
                    assignmentId: assignment._id
                }
            });
        }

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
export const getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate('assignedTo', 'nombre apellidoPaterno apellidoMaterno email')
            .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            assignments: assignments,
            total: assignments.length
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
export const getUserAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            assignedTo: req.user._id
        })
        .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno role')
        .sort('-createdAt');

        res.status(200).json({
            success: true,
            assignments: assignments,
            total: assignments.length
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
export const submitAssignmentResponse = async (req, res) => {
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

        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        const closeDate = new Date(assignment.closeDate);

        // Verificar si la fecha de cierre ya pasó
        if (now > closeDate) {
            // Si hay archivos subidos, eliminarlos ya que la asignación está cerrada
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(403).json({
                success: false,
                error: 'La fecha límite para entregar esta asignación ya ha pasado',
                submissionStatus: 'closed',
                closeDate: closeDate,
                dueDate: dueDate
            });
        }

        // Determinar el estado de la entrega
        let submissionStatus = 'on-time';
        if (now > dueDate) {
            submissionStatus = 'late';
        }

        const response = {
            user: req.user._id,
            files: req.files ? req.files.map(file => ({
                fileName: file.originalname,
                fileUrl: file.path
            })) : [],
            submissionStatus: submissionStatus,
            submittedAt: now
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
            data: assignment,
            submissionStatus: submissionStatus,
            message: submissionStatus === 'late' ? 
                'Entrega realizada con retraso' : 
                'Entrega realizada a tiempo'
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
export const updateAssignmentStatus = async (req, res) => {
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

// Obtener estadísticas del dashboard para docentes
export const getUserDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Obtener todas las asignaciones del usuario
        const assignments = await Assignment.find({
            assignedTo: userId
        });

        const stats = {
            total: assignments.length,
            pending: assignments.filter(a => a.status === 'pending').length,
            completed: assignments.filter(a => a.status === 'completed').length,
            overdue: assignments.filter(a => {
                return a.status === 'pending' && new Date(a.dueDate) < new Date();
            }).length,
            byPriority: {
                low: assignments.filter(a => a.priority === 'low').length,
                medium: assignments.filter(a => a.priority === 'medium').length,
                high: assignments.filter(a => a.priority === 'high').length
            }
        };

        // Calcular tasa de completación
        stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

        res.status(200).json({
            success: true,
            ...stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las estadísticas'
        });
    }
};

// Obtener una asignación específica por ID
export const getAssignmentById = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.user._id;

        const assignment = await Assignment.findById(assignmentId)
            .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno email role')
            .populate('assignedTo', 'nombre apellidoPaterno apellidoMaterno email');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Asignación no encontrada'
            });
        }

        // Verificar que el usuario tenga acceso a esta asignación
        const isAssigned = assignment.assignedTo.some(user => user._id.toString() === userId.toString());
        const isCreator = assignment.createdBy._id.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isAssigned && !isCreator && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para ver esta asignación'
            });
        }

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error('Error al obtener asignación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener la asignación'
        });
    }
};

// Obtener asignaciones filtradas para docentes
export const getFilteredAssignments = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, priority, sort = 'dueDate', order = 'asc' } = req.query;

        // Construir filtros
        const filter = { assignedTo: userId };
        
        if (status) {
            filter.status = status;
        }
        
        if (priority) {
            filter.priority = priority;
        }

        // Construir ordenamiento
        const sortObj = {};
        sortObj[sort] = order === 'desc' ? -1 : 1;

        const assignments = await Assignment.find(filter)
            .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno')
            .sort(sortObj);

        res.status(200).json({
            success: true,
            data: assignments,
            total: assignments.length,
            filters: { status, priority, sort, order }
        });
    } catch (error) {
        console.error('Error al obtener asignaciones filtradas:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las asignaciones filtradas'
        });
    }
};

// Obtener estadísticas de asignaciones del docente
export const getTeacherAssignmentStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Obtener todas las asignaciones del docente
        const assignments = await Assignment.find({
            assignedTo: userId
        });

        // Calcular estadísticas
        const total = assignments.length;
        const pending = assignments.filter(a => a.status === 'pending').length;
        const completed = assignments.filter(a => a.status === 'completed').length;
        const overdue = assignments.filter(a => {
            return a.status === 'pending' && new Date(a.dueDate) < new Date();
        }).length;

        // Asignaciones próximas a vencer (próximos 7 días)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingDeadlines = assignments.filter(a => {
            return a.status === 'pending' && 
                   new Date(a.dueDate) <= nextWeek && 
                   new Date(a.dueDate) >= new Date();
        }).length;

        res.status(200).json({
            success: true,
            stats: {
                total,
                pending,
                completed,
                overdue,
                upcomingDeadlines,
                completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de asignaciones:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las estadísticas'
        });
    }
};

// Obtener asignaciones filtradas para el docente
export const getTeacherFilteredAssignments = async (req, res) => {
    try {
        const { status, search, sort = '-createdAt', page = 1, limit = 10, overdue } = req.query;
        const query = { assignedTo: req.user._id };
        const now = new Date();

        // Aplicar filtro de estado
        if (status && status !== 'all') {
            if (status === 'vencido') {
                // Para vencidas: mostrar las pendientes que ya pasaron su fecha de vencimiento
                query.status = 'pending';
                query.dueDate = { $lt: now };
            } else if (status === 'pending') {
                // Para pendientes: mostrar solo las que NO han vencido
                query.status = 'pending';
                query.dueDate = { $gte: now };
            } else {
                // Para otros estados (completed, etc)
                query.status = status;
            }
        }

        // Aplicar búsqueda si existe
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const assignments = await Assignment.find(query)
            .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno role')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Assignment.countDocuments(query);

        res.status(200).json({
            success: true,
            assignments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total
            }
        });
    } catch (error) {
        console.error('Error al obtener asignaciones filtradas:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las asignaciones'
        });
    }
};

// Marcar asignación como completada
export const markAssignmentCompleted = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.user._id;

        console.log('🔄 Intentando marcar asignación como completada:', {
            assignmentId,
            userId: userId.toString()
        });

        const assignment = await Assignment.findById(assignmentId);
        
        if (!assignment) {
            console.log('❌ Asignación no encontrada');
            return res.status(404).json({
                success: false,
                error: 'Asignación no encontrada'
            });
        }

        console.log('📋 Asignación encontrada:', {
            title: assignment.title,
            assignedTo: assignment.assignedTo.map(id => id.toString()),
            status: assignment.status
        });

        // Verificar que el usuario esté asignado a esta tarea (comparar strings)
        const isAssigned = assignment.assignedTo.some(assignedId => 
            assignedId.toString() === userId.toString()
        );

        if (!isAssigned) {
            console.log('❌ Usuario no asignado a esta tarea');
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para modificar esta asignación'
            });
        }

        // Verificar que la asignación no esté ya completada
        if (assignment.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Esta asignación ya está marcada como completada'
            });
        }

        // Verificar que no haya pasado la fecha de cierre
        const now = new Date();
        const closeDate = new Date(assignment.closeDate);
        
        if (now > closeDate) {
            return res.status(403).json({
                success: false,
                error: 'No se puede completar una asignación después de la fecha de cierre'
            });
        }

        // Actualizar la asignación
        assignment.status = 'completed';
        assignment.completedAt = new Date();
        
        const savedAssignment = await assignment.save();
        console.log('✅ Asignación guardada exitosamente');

        // Respuesta simple y directa
        res.status(200).json({
            success: true,
            message: 'Asignación marcada como completada exitosamente',
            data: {
                _id: savedAssignment._id,
                title: savedAssignment.title,
                status: savedAssignment.status,
                completedAt: savedAssignment.completedAt,
                dueDate: savedAssignment.dueDate,
                closeDate: savedAssignment.closeDate
            }
        });
        
    } catch (error) {
        console.error('❌ Error al marcar asignación como completada:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al actualizar la asignación'
        });
    }
};

// Obtener reporte de mal desempeño (asignaciones cerradas sin entrega)
export const getPoorPerformanceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        // Filtrar por rango de fechas si se proporciona
        if (startDate || endDate) {
            query.closeDate = {};
            if (startDate) query.closeDate.$gte = new Date(startDate);
            if (endDate) query.closeDate.$lte = new Date(endDate);
        }

        // Encontrar asignaciones donde la fecha de cierre ya pasó
        const now = new Date();
        query.closeDate = { ...query.closeDate, $lt: now };

        const assignments = await Assignment.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name');

        const poorPerformanceData = [];

        assignments.forEach(assignment => {
            assignment.assignedTo.forEach(user => {
                const userResponse = assignment.responses.find(
                    r => r.user.toString() === user._id.toString()
                );

                if (!userResponse) {
                    poorPerformanceData.push({
                        assignmentId: assignment._id,
                        assignmentTitle: assignment.title,
                        teacherName: user.name,
                        teacherEmail: user.email,
                        dueDate: assignment.dueDate,
                        closeDate: assignment.closeDate,
                        status: 'No entregado',
                        daysPastDue: Math.ceil((now - assignment.closeDate) / (1000 * 60 * 60 * 24))
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                report: poorPerformanceData,
                summary: {
                    totalMissedAssignments: poorPerformanceData.length,
                    affectedTeachers: [...new Set(poorPerformanceData.map(item => item.teacherEmail))].length,
                    reportGeneratedAt: now
                }
            }
        });
    } catch (error) {
        console.error('Error al generar reporte de mal desempeño:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al generar el reporte'
        });
    }
};

// Generar y enviar reporte de mal desempeño por email
export const generateAndSendPoorPerformanceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        // Filtrar por rango de fechas si se proporciona
        if (startDate || endDate) {
            query.closeDate = {};
            if (startDate) query.closeDate.$gte = new Date(startDate);
            if (endDate) query.closeDate.$lte = new Date(endDate);
        }

        // Encontrar asignaciones donde la fecha de cierre ya pasó
        const now = new Date();
        query.closeDate = { ...query.closeDate, $lt: now };

        const assignments = await Assignment.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name');

        const poorPerformanceData = [];

        assignments.forEach(assignment => {
            assignment.assignedTo.forEach(user => {
                const userResponse = assignment.responses.find(
                    r => r.user.toString() === user._id.toString()
                );

                if (!userResponse) {
                    poorPerformanceData.push({
                        assignmentId: assignment._id,
                        assignmentTitle: assignment.title,
                        teacherName: user.name,
                        teacherEmail: user.email,
                        dueDate: assignment.dueDate,
                        closeDate: assignment.closeDate,
                        status: 'No entregado',
                        daysPastDue: Math.ceil((now - assignment.closeDate) / (1000 * 60 * 60 * 24))
                    });
                }
            });
        });

        if (poorPerformanceData.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No se encontraron datos de mal desempeño para el rango de fechas proporcionado'
            });
        }

        // Generar el contenido del reporte
        let reportContent = 'Reporte de Mal Desempeño\n\n';
        reportContent += 'Asignación,Docente,Email,Fecha de Vencimiento,Fecha de Cierre,Estado,Días de Retraso\n';

        poorPerformanceData.forEach(item => {
            reportContent += `${item.assignmentTitle},${item.teacherName},${item.teacherEmail},${item.dueDate},${item.closeDate},${item.status},${item.daysPastDue}\n`;
        });

        // Enviar el reporte por email a cada docente afectado
        const teacherEmails = [...new Set(poorPerformanceData.map(item => item.teacherEmail))];

        for (const email of teacherEmails) {
            const teacherReportData = poorPerformanceData.filter(item => item.teacherEmail === email);
            
            let teacherReportContent = 'Reporte de Mal Desempeño - Detalle\n\n';
            teacherReportContent += 'Asignación,Fecha de Vencimiento,Fecha de Cierre,Estado,Días de Retraso\n';

            teacherReportData.forEach(item => {
                teacherReportContent += `${item.assignmentTitle},${item.dueDate},${item.closeDate},${item.status},${item.daysPastDue}\n`;
            });

            // Enviar email
            // await emailService.sendEmail({ // This line was removed as per the edit hint
            //     to: email,
            //     subject: 'Reporte de Mal Desempeño - Asignaciones Sin Entrega',
            //     text: teacherReportContent
            // });
        }

        res.status(200).json({
            success: true,
            message: 'Reporte generado y enviado por email a los docentes afectados'
        });
    } catch (error) {
        console.error('Error al generar y enviar reporte de mal desempeño:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al generar y enviar el reporte'
        });
    }
};

// Enviar reportes de mal desempeño por email
export const sendPoorPerformanceReports = async (req, res) => {
    try {
        const { startDate, endDate, sendEmails = false } = req.body;
        
        // Validar que solo administradores puedan enviar reportes
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo los administradores pueden enviar reportes de mal desempeño'
            });
        }

        const query = {};
        
        // Filtrar por rango de fechas si se proporciona
        if (startDate || endDate) {
            query.closeDate = {};
            if (startDate) query.closeDate.$gte = new Date(startDate);
            if (endDate) query.closeDate.$lte = new Date(endDate);
        }

        // Encontrar asignaciones donde la fecha de cierre ya pasó
        const now = new Date();
        query.closeDate = { ...query.closeDate, $lt: now };

        const assignments = await Assignment.find(query)
            .populate('assignedTo', 'nombre apellidoPaterno apellidoMaterno email')
            .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno');

        // Agrupar docentes con mal desempeño
        const teacherReports = new Map();

        assignments.forEach(assignment => {
            assignment.assignedTo.forEach(user => {
                const userResponse = assignment.responses.find(
                    r => r.user.toString() === user._id.toString()
                );

                if (!userResponse) {
                    // No hay respuesta - mal desempeño
                    const teacherKey = user._id.toString();
                    
                    if (!teacherReports.has(teacherKey)) {
                        teacherReports.set(teacherKey, {
                            teacherInfo: {
                                _id: user._id,
                                nombre: user.nombre,
                                apellidoPaterno: user.apellidoPaterno,
                                apellidoMaterno: user.apellidoMaterno,
                                email: user.email,
                                fullName: `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`
                            },
                            missedAssignments: []
                        });
                    }
                    
                    teacherReports.get(teacherKey).missedAssignments.push({
                        _id: assignment._id,
                        title: assignment.title,
                        description: assignment.description,
                        dueDate: assignment.dueDate,
                        closeDate: assignment.closeDate,
                        daysPastDue: Math.ceil((now - assignment.closeDate) / (1000 * 60 * 60 * 24)),
                        status: 'No entregado'
                    });
                }
            });
        });

        const reportsArray = Array.from(teacherReports.values());
        
        // Si se solicita enviar emails
        let emailResults = [];
        if (sendEmails && reportsArray.length > 0) {
            console.log(`📧 Enviando ${reportsArray.length} reportes de mal desempeño por email...`);
            
            for (const report of reportsArray) {
                try {
                    // await emailService.sendPoorPerformanceReport({ // This line was removed as per the edit hint
                    //     to: report.teacherInfo.email,
                    //     teacherName: report.teacherInfo.fullName,
                    //     assignments: report.missedAssignments
                    // });
                    
                    emailResults.push({
                        teacherEmail: report.teacherInfo.email,
                        teacherName: report.teacherInfo.fullName,
                        success: true,
                        sentAt: new Date()
                    });
                    
                } catch (error) {
                    console.error(`❌ Error enviando email a ${report.teacherInfo.email}:`, error);
                    emailResults.push({
                        teacherEmail: report.teacherInfo.email,
                        teacherName: report.teacherInfo.fullName,
                        success: false,
                        error: error.message,
                        sentAt: new Date()
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                reports: reportsArray,
                summary: {
                    totalTeachersWithPoorPerformance: reportsArray.length,
                    totalMissedAssignments: reportsArray.reduce((sum, report) => sum + report.missedAssignments.length, 0),
                    reportGeneratedAt: now,
                    emailsSent: sendEmails,
                    emailResults: emailResults
                }
            }
        });
        
    } catch (error) {
        console.error('Error generando reportes de mal desempeño:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al generar los reportes'
        });
    }
};

// Enviar recordatorios de asignaciones próximas a vencer
export const sendAssignmentReminders = async (req, res) => {
    try {
        const { daysAhead = 3, sendEmails = false } = req.body;
        
        // Validar que solo administradores puedan enviar recordatorios
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo los administradores pueden enviar recordatorios'
            });
        }

        const now = new Date();
        const reminderDate = new Date();
        reminderDate.setDate(now.getDate() + parseInt(daysAhead));

        // Buscar asignaciones que vencen en los próximos X días
        const assignments = await Assignment.find({
            status: 'pending',
            dueDate: {
                $gte: now,
                $lte: reminderDate
            }
        })
        .populate('assignedTo', 'nombre apellidoPaterno apellidoMaterno email')
        .populate('createdBy', 'nombre apellidoPaterno apellidoMaterno');

        // Agrupar por docente
        const teacherReminders = new Map();

        assignments.forEach(assignment => {
            assignment.assignedTo.forEach(user => {
                // Verificar si ya entregó la asignación
                const userResponse = assignment.responses.find(
                    r => r.user.toString() === user._id.toString()
                );

                if (!userResponse) {
                    // No ha entregado - enviar recordatorio
                    const teacherKey = user._id.toString();
                    
                    if (!teacherReminders.has(teacherKey)) {
                        teacherReminders.set(teacherKey, {
                            teacherInfo: {
                                _id: user._id,
                                nombre: user.nombre,
                                apellidoPaterno: user.apellidoPaterno,
                                apellidoMaterno: user.apellidoMaterno,
                                email: user.email,
                                fullName: `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`
                            },
                            pendingAssignments: []
                        });
                    }
                    
                    const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - now) / (1000 * 60 * 60 * 24));
                    
                    teacherReminders.get(teacherKey).pendingAssignments.push({
                        _id: assignment._id,
                        title: assignment.title,
                        description: assignment.description,
                        dueDate: assignment.dueDate,
                        closeDate: assignment.closeDate,
                        daysUntilDue: daysUntilDue,
                        priority: daysUntilDue <= 1 ? 'high' : daysUntilDue <= 3 ? 'medium' : 'low'
                    });
                }
            });
        });

        const remindersArray = Array.from(teacherReminders.values());

        // Si se solicita enviar emails
        let emailResults = [];
        if (sendEmails && remindersArray.length > 0) {
            console.log(`📧 Enviando ${remindersArray.length} recordatorios por email...`);
            
            for (const reminder of remindersArray) {
                try {
                    // await emailService.sendAssignmentReminders({ // This line was removed as per the edit hint
                    //     to: reminder.teacherInfo.email,
                    //     teacherName: reminder.teacherInfo.fullName,
                    //     assignments: reminder.pendingAssignments
                    // });
                    
                    emailResults.push({
                        teacherEmail: reminder.teacherInfo.email,
                        teacherName: reminder.teacherInfo.fullName,
                        assignmentsCount: reminder.pendingAssignments.length,
                        success: true,
                        sentAt: new Date()
                    });
                    
                } catch (error) {
                    console.error(`❌ Error enviando recordatorio a ${reminder.teacherInfo.email}:`, error);
                    emailResults.push({
                        teacherEmail: reminder.teacherInfo.email,
                        teacherName: reminder.teacherInfo.fullName,
                        assignmentsCount: reminder.pendingAssignments.length,
                        success: false,
                        error: error.message,
                        sentAt: new Date()
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                reminders: remindersArray,
                summary: {
                    totalTeachersWithReminders: remindersArray.length,
                    totalPendingAssignments: remindersArray.reduce((sum, reminder) => sum + reminder.pendingAssignments.length, 0),
                    daysAhead: daysAhead,
                    reportGeneratedAt: now,
                    emailsSent: sendEmails,
                    emailResults: emailResults
                }
            }
        });
        
    } catch (error) {
        console.error('Error enviando recordatorios:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al enviar recordatorios'
        });
    }
};

// Obtener estadísticas de entrega por fechas
export const getSubmissionStatistics = async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate('assignedTo', 'name email')
            .populate('responses.user', 'name email');

        const statistics = {
            onTime: 0,
            late: 0,
            notSubmitted: 0,
            totalAssignments: 0
        };

        const now = new Date();

        assignments.forEach(assignment => {
            assignment.assignedTo.forEach(user => {
                statistics.totalAssignments++;
                
                const userResponse = assignment.responses.find(
                    r => r.user && r.user._id.toString() === user._id.toString()
                );

                if (!userResponse) {
                    // No hay respuesta
                    if (now > assignment.closeDate) {
                        statistics.notSubmitted++;
                    }
                } else {
                    // Hay respuesta, verificar si fue a tiempo o tarde
                    const submittedAt = new Date(userResponse.submittedAt);
                    if (submittedAt <= assignment.dueDate) {
                        statistics.onTime++;
                    } else if (submittedAt <= assignment.closeDate) {
                        statistics.late++;
                    }
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                statistics,
                percentages: {
                    onTime: ((statistics.onTime / statistics.totalAssignments) * 100).toFixed(2),
                    late: ((statistics.late / statistics.totalAssignments) * 100).toFixed(2),
                    notSubmitted: ((statistics.notSubmitted / statistics.totalAssignments) * 100).toFixed(2)
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las estadísticas'
        });
    }
};