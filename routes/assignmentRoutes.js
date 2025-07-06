const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const {
    createAssignment,
    getAllAssignments,
    getUserAssignments,
    submitAssignmentResponse,
    updateAssignmentStatus
} = require('../controllers/assignmentController');

// Rutas para administradores
router.post('/', 
    auth, 
    upload.array('attachments', 5),
    handleMulterError,
    createAssignment
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

module.exports = router; 