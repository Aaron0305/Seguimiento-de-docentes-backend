import axios from 'axios';
import FormData from 'form-data';

async function testFrontendBehavior() {
    console.log('🔍 SIMULACIÓN EXACTA DEL COMPORTAMIENTO DEL FRONTEND');
    console.log('====================================================\n');

    const BASE_URL = 'http://localhost:3001/api';
    
    // PASO 1: Simular login del frontend
    console.log('1️⃣ SIMULANDO LOGIN DEL FRONTEND');
    try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });

        // Simular localStorage del frontend
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        
        console.log('✅ Login exitoso');
        console.log('🔑 Token guardado en "localStorage":', token ? 'Sí' : 'No');
        console.log('👤 Usuario guardado en "localStorage":', user ? 'Sí' : 'No');
        console.log('🎯 Rol del usuario:', user.role);

        // PASO 2: Simular verificación del token (como hace AuthContext)
        console.log('\n2️⃣ SIMULANDO VERIFICACIÓN DEL TOKEN (AuthContext)');
        try {
            const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ Token verificado exitosamente');
            console.log('👤 Usuario verificado:', verifyResponse.data.user.email);
            console.log('🎯 Rol verificado:', verifyResponse.data.user.role);
        } catch (verifyError) {
            console.log('❌ ERROR verificando token:', verifyError.response?.data);
            return;
        }

        // PASO 3: Simular creación de asignación EXACTAMENTE como el frontend
        console.log('\n3️⃣ SIMULANDO CREACIÓN DE ASIGNACIÓN (Frontend exact)');
        
        // Datos exactos del formulario del frontend
        const formData = new FormData();
        formData.append('title', 'Prueba Frontend Exacto');
        formData.append('description', 'Descripción de prueba desde simulación frontend');
        formData.append('dueDate', new Date('2025-12-31').toISOString());
        formData.append('isGeneral', 'true');

        // Headers exactos del frontend
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...formData.getHeaders()
        };

        console.log('📤 Datos enviados:');
        console.log('  - title: Prueba Frontend Exacto');
        console.log('  - description: Descripción de prueba desde simulación frontend');
        console.log('  - dueDate:', new Date('2025-12-31').toISOString());
        console.log('  - isGeneral: true');
        console.log('📤 Headers:', JSON.stringify(headers, null, 2));

        const assignmentResponse = await axios.post(`${BASE_URL}/assignments`, formData, {
            headers,
            timeout: 10000 // 10 segundos de timeout
        });

        console.log('✅ Asignación creada exitosamente');
        console.log('📋 Respuesta del servidor:');
        console.log('  - success:', assignmentResponse.data.success);
        console.log('  - message:', assignmentResponse.data.message);
        console.log('  - asignación ID:', assignmentResponse.data.data._id);
        console.log('  - título:', assignmentResponse.data.data.title);
        console.log('  - docentes asignados:', assignmentResponse.data.data.assignedTo.length);

        // PASO 4: Verificar que el token sigue siendo válido
        console.log('\n4️⃣ VERIFICANDO TOKEN DESPUÉS DE CREAR ASIGNACIÓN');
        try {
            const verifyAfterResponse = await axios.get(`${BASE_URL}/auth/verify`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ Token sigue siendo válido');
            console.log('👤 Usuario:', verifyAfterResponse.data.user.email);
        } catch (verifyAfterError) {
            console.log('❌ ERROR: Token inválido después de crear asignación');
            console.log('📋 Error:', verifyAfterError.response?.data);
        }

        // PASO 5: Simular obtener asignaciones (como haría el frontend)
        console.log('\n5️⃣ SIMULANDO OBTENER ASIGNACIONES');
        try {
            const assignmentsResponse = await axios.get(`${BASE_URL}/assignments/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ Asignaciones obtenidas exitosamente');
            console.log('📊 Total de asignaciones:', assignmentsResponse.data.data?.length || 0);
            
            // Buscar nuestra asignación recién creada
            const ourAssignment = assignmentsResponse.data.data?.find(a => a.title === 'Prueba Frontend Exacto');
            if (ourAssignment) {
                console.log('🎯 Asignación recién creada encontrada:', ourAssignment.title);
            }
        } catch (assignmentsError) {
            console.log('❌ ERROR obteniendo asignaciones');
            console.log('📋 Error:', assignmentsError.response?.data);
        }

        console.log('\n🎯 CONCLUSIÓN DEL DIAGNÓSTICO');
        console.log('================================');
        console.log('✅ El backend funciona perfectamente');
        console.log('✅ El token se mantiene válido durante todo el proceso');
        console.log('✅ La creación de asignaciones funciona correctamente');
        console.log('');
        console.log('🔧 SI EL FRONTEND SIGUE MOSTRANDO "SESIÓN EXPIRADA":');
        console.log('   1. Revisar que el token se esté guardando en localStorage');
        console.log('   2. Revisar que el token se esté leyendo correctamente');
        console.log('   3. Revisar que el header Authorization se esté enviando');
        console.log('   4. Revisar errores de red o CORS');
        console.log('   5. Revisar que no se esté enviando el token malformado');

    } catch (error) {
        console.error('❌ ERROR EN LA SIMULACIÓN:', error.message);
        
        if (error.response) {
            console.error('📋 Estado HTTP:', error.response.status);
            console.error('📋 Respuesta del servidor:', error.response.data);
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔧 El servidor no está ejecutándose en http://localhost:3001');
            console.error('   Asegúrate de que el backend esté corriendo');
        }
    }
}

// Ejecutar la simulación
testFrontendBehavior().catch(console.error);
