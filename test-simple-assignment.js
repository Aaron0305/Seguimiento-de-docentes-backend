console.log('🧪 Testing simple assignment creation...');

const BASE_URL = 'http://localhost:3001/api';

async function testSimpleAssignment() {
    try {
        // Login
        console.log('1. Logging in...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful');
        
        // Create assignment with only required fields
        console.log('2. Creating assignment...');
        
        const now = new Date();
        const dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
        const closeDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
        
        const formData = new FormData();
        formData.append('title', 'Test Simple Assignment');
        formData.append('description', 'Simple test description');
        formData.append('dueDate', dueDate.toISOString());
        formData.append('closeDate', closeDate.toISOString());
        formData.append('isGeneral', 'true');
        
        console.log('📤 Sending data:');
        console.log('  - title:', 'Test Simple Assignment');
        console.log('  - description:', 'Simple test description');
        console.log('  - dueDate:', dueDate.toISOString());
        console.log('  - closeDate:', closeDate.toISOString());
        console.log('  - isGeneral:', 'true');
        
        const response = await fetch(`${BASE_URL}/assignments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response data:', JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('✅ Assignment creation successful');
            
            // Verify in database
            console.log('3. Verifying in database...');
            
            // Import mongoose directly
            const mongoose = await import('mongoose');
            const Assignment = (await import('./models/Assignment.js')).default;
            
            await mongoose.default.connect('mongodb://localhost:27017/seguimiento-docentes');
            
            const savedAssignment = await Assignment.findById(data.data._id);
            console.log('📋 Assignment in database:', {
                id: savedAssignment._id,
                title: savedAssignment.title,
                dueDate: savedAssignment.dueDate,
                closeDate: savedAssignment.closeDate,
                isGeneral: savedAssignment.isGeneral
            });
            
            mongoose.default.disconnect();
        } else {
            console.log('❌ Assignment creation failed');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSimpleAssignment();
