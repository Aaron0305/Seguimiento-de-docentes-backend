import axios from 'axios';

console.log('🧪 PROBANDO FUNCIONALIDAD DE COMPLETAR ASIGNACIONES');
console.log('===================================================\n');

async function testCompleteAssignment() {
    const BASE_URL = 'http://localhost:3001/api';
    let teacherToken = null;
    let assignmentId = null;

    try {
        // 1. Login como docente
        console.log('1️⃣ Login como docente...');
        const teacherLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });
        teacherToken = teacherLogin.data.token;
        console.log('✅ Login de docente exitoso');

        // 2. Obtener asignaciones del docente
        console.log('\n2️⃣ Obteniendo asignaciones del docente...');
        const assignmentsResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Asignaciones obtenidas:', assignmentsResponse.data.assignments.length);

        // Encontrar una asignación pendiente
        const pendingAssignment = assignmentsResponse.data.assignments.find(a => a.status === 'pending');
        
        if (!pendingAssignment) {
            console.log('❌ No se encontraron asignaciones pendientes para completar');
            return;
        }

        assignmentId = pendingAssignment._id;
        console.log(`📝 Asignación seleccionada: ${pendingAssignment.title}`);
        console.log(`   - ID: ${assignmentId}`);
        console.log(`   - Estado: ${pendingAssignment.status}`);
        console.log(`   - Vence: ${new Date(pendingAssignment.dueDate).toLocaleString()}`);
        console.log(`   - Cierra: ${new Date(pendingAssignment.closeDate).toLocaleString()}`);

        // 3. Verificar si la asignación está cerrada
        const now = new Date();
        const closeDate = new Date(pendingAssignment.closeDate);
        
        if (now > closeDate) {
            console.log('⚠️ La asignación está cerrada, no se puede completar');
            return;
        }

        // 4. Intentar completar la asignación
        console.log('\n3️⃣ Intentando completar la asignación...');
        
        try {
            const completeResponse = await axios.patch(
                `${BASE_URL}/assignments/teacher/${assignmentId}/complete`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${teacherToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Asignación completada exitosamente!');
            console.log('   Respuesta:', completeResponse.data.message);
            console.log('   Nuevo estado:', completeResponse.data.data?.status || 'Estado no disponible en respuesta');
            console.log('   Respuesta completa:', JSON.stringify(completeResponse.data, null, 2));

        } catch (error) {
            console.log('❌ Error al completar la asignación:');
            console.log('   Status:', error.response?.status);
            console.log('   Error:', error.response?.data?.error || error.message);
            console.log('   Respuesta completa:', error.response?.data);
        }

        // 5. Verificar que la asignación se haya completado
        console.log('\n4️⃣ Verificando el estado de la asignación...');
        
        const verifyResponse = await axios.get(`${BASE_URL}/assignments/${assignmentId}`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });

        console.log('📋 Estado verificado:');
        console.log('   Título:', verifyResponse.data.data.title);
        console.log('   Estado:', verifyResponse.data.data.status);
        console.log('   Completada el:', verifyResponse.data.data.completedAt ? 
            new Date(verifyResponse.data.data.completedAt).toLocaleString() : 'No completada');

    } catch (error) {
        console.error('❌ Error general:', error.response?.data || error.message);
    }
}

testCompleteAssignment();
