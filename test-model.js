import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';

const testAssignment = new Assignment({
    title: 'Test Assignment with dates',
    description: 'Testing closeDate field',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    closeDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isGeneral: true,
    createdBy: '686adb66894909cadb9449bf', // Admin ID
    assignedTo: []
});

console.log('Testing Assignment model...');
console.log('Assignment data before save:', {
    title: testAssignment.title,
    dueDate: testAssignment.dueDate,
    closeDate: testAssignment.closeDate,
    isGeneral: testAssignment.isGeneral
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/seguimiento-docentes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    try {
        const savedAssignment = await testAssignment.save();
        console.log('Assignment saved successfully!');
        console.log('Saved assignment:', {
            id: savedAssignment._id,
            title: savedAssignment.title,
            dueDate: savedAssignment.dueDate,
            closeDate: savedAssignment.closeDate,
            isGeneral: savedAssignment.isGeneral
        });
        
        // Test retrieval
        const retrievedAssignment = await Assignment.findById(savedAssignment._id);
        console.log('Retrieved assignment:', {
            id: retrievedAssignment._id,
            title: retrievedAssignment.title,
            dueDate: retrievedAssignment.dueDate,
            closeDate: retrievedAssignment.closeDate,
            isGeneral: retrievedAssignment.isGeneral
        });
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`  ${key}: ${error.errors[key].message}`);
            });
        }
    } finally {
        mongoose.disconnect();
    }
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});
