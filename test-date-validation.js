console.log('🧪 Testing assignment creation with due date and close date...');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const adminCredentials = {
    email: 'admin@test.com',
    password: 'admin123'
};

// Test assignment with both dates
const testAssignment = {
    title: 'Asignación con fechas de vencimiento y cierre',
    description: 'Esta asignación prueba el nuevo sistema con fecha de vencimiento y fecha de cierre.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días desde ahora
    closeDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días desde ahora
    isGeneral: true
};

async function testDateValidation() {
    try {
        // 1. Login as admin
        console.log('\n1. 🔐 Logging in as admin...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adminCredentials)
        });
        
        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginData.error || loginData.message}`);
        }
        
        const token = loginData.token;
        console.log('✅ Login successful');
        
        // 2. Test assignment creation with valid dates
        console.log('\n2. 📝 Creating assignment with valid dates...');
        const formData = new FormData();
        formData.append('title', testAssignment.title);
        formData.append('description', testAssignment.description);
        formData.append('dueDate', testAssignment.dueDate);
        formData.append('closeDate', testAssignment.closeDate);
        formData.append('isGeneral', testAssignment.isGeneral);
        
        const createResponse = await fetch(`${BASE_URL}/assignments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const createData = await createResponse.json();
        
        if (!createResponse.ok) {
            throw new Error(`Assignment creation failed: ${createData.error}`);
        }
        
        console.log('✅ Assignment created successfully');
        console.log('📋 Full response:', JSON.stringify(createData, null, 2));
        console.log('📋 Assignment details:', {
            id: createData.data._id,
            title: createData.data.title,
            dueDate: createData.data.dueDate,
            closeDate: createData.data.closeDate
        });
        
        // 3. Test assignment creation with invalid dates (close before due)
        console.log('\n3. ❌ Testing assignment creation with invalid dates...');
        const invalidFormData = new FormData();
        invalidFormData.append('title', 'Invalid Assignment');
        invalidFormData.append('description', 'This should fail');
        invalidFormData.append('dueDate', new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()); // 5 days
        invalidFormData.append('closeDate', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()); // 2 days (invalid)
        invalidFormData.append('isGeneral', true);
        
        const invalidResponse = await fetch(`${BASE_URL}/assignments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: invalidFormData
        });
        
        const invalidData = await invalidResponse.json();
        
        if (invalidResponse.ok) {
            console.log('❌ FAIL: Invalid assignment was created (should have failed)');
        } else {
            console.log('✅ PASS: Invalid assignment rejected as expected');
            console.log('📝 Error message:', invalidData.error);
        }
        
        // 4. Get teacher assignments to verify new fields
        console.log('\n4. 📋 Testing teacher assignment retrieval...');
        
        // Login as teacher first
        const teacherCredentials = {
            email: 'andreslopezpina187@gmail.com',
            password: 'docente123'
        };
        
        const teacherLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teacherCredentials)
        });
        
        const teacherLoginData = await teacherLoginResponse.json();
        
        if (!teacherLoginResponse.ok) {
            throw new Error(`Teacher login failed: ${teacherLoginData.error || teacherLoginData.message}`);
        }
        
        const teacherToken = teacherLoginData.token;
        console.log('✅ Teacher login successful');
        
        // Get teacher assignments
        const assignmentsResponse = await fetch(`${BASE_URL}/assignments/teacher/assignments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        
        const assignmentsData = await assignmentsResponse.json();
        
        if (!assignmentsResponse.ok) {
            throw new Error(`Failed to get assignments: ${assignmentsData.error}`);
        }
        
        console.log('✅ Teacher assignments retrieved successfully');
        console.log(`📊 Found ${assignmentsData.data.assignments.length} assignments`);
        
        // Check if our new assignment is included and has both dates
        const newAssignment = assignmentsData.data.assignments.find(a => a.title === testAssignment.title);
        if (newAssignment) {
            console.log('✅ New assignment found in teacher\'s list');
            console.log('📅 Dates:', {
                dueDate: newAssignment.dueDate,
                closeDate: newAssignment.closeDate
            });
            
            // Test assignment status calculation
            const now = new Date();
            const due = new Date(newAssignment.dueDate);
            const close = new Date(newAssignment.closeDate);
            
            console.log('🕒 Date comparison:');
            console.log(`   Now:       ${now.toISOString()}`);
            console.log(`   Due Date:  ${due.toISOString()}`);
            console.log(`   Close Date: ${close.toISOString()}`);
            console.log(`   Status: ${now > close ? 'CLOSED' : now > due ? 'LATE' : 'ON_TIME'}`);
        } else {
            console.log('❌ New assignment not found in teacher\'s list');
        }
        
        // 5. Test submission attempt after close date (simulate)
        console.log('\n5. ⏰ Testing date-based submission logic...');
        
        // Create an assignment that's already closed for testing
        const pastAssignment = {
            title: 'Already Closed Assignment',
            description: 'This assignment is already closed for testing',
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            closeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            isGeneral: true
        };
        
        const pastFormData = new FormData();
        pastFormData.append('title', pastAssignment.title);
        pastFormData.append('description', pastAssignment.description);
        pastFormData.append('dueDate', pastAssignment.dueDate);
        pastFormData.append('closeDate', pastAssignment.closeDate);
        pastFormData.append('isGeneral', pastAssignment.isGeneral);
        
        const pastResponse = await fetch(`${BASE_URL}/assignments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: pastFormData
        });
        
        const pastData = await pastResponse.json();
        
        if (pastResponse.ok) {
            console.log('✅ Past assignment created for testing');
            const pastAssignmentId = pastData.data._id;
            
            // Try to submit to this closed assignment
            const submitResponse = await fetch(`${BASE_URL}/assignments/${pastAssignmentId}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${teacherToken}`
                }
            });
            
            const submitData = await submitResponse.json();
            
            if (submitResponse.ok) {
                console.log('❌ FAIL: Submission was accepted for closed assignment');
            } else {
                console.log('✅ PASS: Submission correctly rejected for closed assignment');
                console.log('📝 Error message:', submitData.error);
            }
        }
        
        console.log('\n🎉 All tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testDateValidation();
