import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import { upload, handleMulterError } from '../middleware/uploadMiddleware.js';
import {
    createAssignment,
    getAllAssignments,
    getUserAssignments,
    submitAssignmentResponse,
    updateAssignmentStatus
} from '../controllers/assignmentController.js';

// Rutas para administradores
router.post('/', 
    auth, 
    upload.array('attachments', 5),
    handleMulterError,
    createAssignment
);

// Ruta temporal sin autenticación para pruebas
router.post('/test', 
    upload.array('attachments', 5),
    handleMulterError,
    async (req, res) => {
        try {
            // Simular usuario admin para la prueba
            req.user = { _id: '686adb66894909cadb9449bf' };
            await createAssignment(req, res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/all', auth, getAllAssignments);
router.patch('/:id/status', auth, updateAssignmentStatus);

// Rutas para docentes
router.get('/my-assignments', auth, getUserAssignments);
router.post('/:id/submit', 
    auth, 
    upload.array('files', 5),
    handleMulterError,
    submitAssignmentResponse
);

export default router; 