console.log('🧪 Testing assignment creation endpoint directly...');

const testAssignmentCreation = async () => {
    try {
        // 1. Login como admin
        console.log('1. 🔐 Logging in...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginData.message}`);
        }
        
        const token = loginData.token;
        console.log('✅ Login successful');
        
        // 2. Crear asignación con ambas fechas
        console.log('\n2. 📝 Creating assignment...');
        
        const formData = new FormData();
        formData.append('title', 'Test Assignment Frontend');
        formData.append('description', 'Testing assignment creation from frontend simulation');
        formData.append('dueDate', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString());
        formData.append('closeDate', new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString());
        formData.append('isGeneral', 'true');
        
        // Debug: mostrar qué datos estamos enviando
        console.log('📤 Datos que se envían:');
        for (let [key, value] of formData.entries()) {
            console.log(`   ${key}: ${value}`);
        }
        
        const response = await fetch('http://localhost:3001/api/assignments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        console.log(`📥 Response status: ${response.status}`);
        
        const data = await response.json();
        console.log('📥 Response data:', JSON.stringify(data, null, 2));
        
        if (!response.ok) {
            throw new Error(`Assignment creation failed: ${data.error || data.message}`);
        }
        
        console.log('✅ Assignment created successfully');
        
        // 3. Verificar campos específicos
        if (data.data) {
            console.log('\n🔍 Verificando campos:');
            console.log(`   Title: ${data.data.title}`);
            console.log(`   DueDate: ${data.data.dueDate}`);
            console.log(`   CloseDate: ${data.data.closeDate}`);
            console.log(`   IsGeneral: ${data.data.isGeneral}`);
            console.log(`   AssignedTo length: ${data.data.assignedTo?.length || 0}`);
            
            if (!data.data.closeDate) {
                console.log('❌ PROBLEMA: closeDate no está presente en la respuesta');
            } else {
                console.log('✅ closeDate está presente en la respuesta');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testAssignmentCreation();
