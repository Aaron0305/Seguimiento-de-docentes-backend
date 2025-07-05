const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const {
    createAssignment,
    getAllAssignments,
    getUserAssignments,
    submitAssignmentResponse,
    updateAssignmentStatus
} = require('../controllers/assignmentController');

// Rutas para administradores
router.post('/', auth, uploadMiddleware.array('attachments'), createAssignment);
router.get('/all', auth, getAllAssignments);
router.patch('/:id/status', auth, updateAssignmentStatus);

// Rutas para docentes
router.get('/my-assignments', auth, getUserAssignments);
router.post('/:id/submit', auth, uploadMiddleware.array('files'), submitAssignmentResponse);

module.exports = router; 