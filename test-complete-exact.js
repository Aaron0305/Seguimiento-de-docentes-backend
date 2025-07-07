import axios from 'axios';

console.log('🧪 SIMULANDO EXACTAMENTE EL FRONTEND');
console.log('=====================================\n');

async function simulateFrontendCompleteAssignment() {
    const BASE_URL = 'http://localhost:3001/api';

    try {
        // 1. Login como docente (exactamente como el frontend)
        console.log('1️⃣ Login como docente...');
        const teacherLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });
        
        const token = teacherLogin.data.token;
        console.log('✅ Login exitoso, token obtenido');

        // 2. Obtener asignaciones del docente
        console.log('\n2️⃣ Obteniendo asignaciones...');
        const assignmentsResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ ${assignmentsResponse.data.assignments.length} asignaciones obtenidas`);

        // Buscar una asignación pendiente
        const pendingAssignment = assignmentsResponse.data.assignments.find(a => 
            a.status === 'pending' && new Date() < new Date(a.closeDate)
        );

        if (!pendingAssignment) {
            console.log('❌ No hay asignaciones pendientes disponibles para completar');
            return;
        }

        console.log(`📝 Asignación seleccionada: ${pendingAssignment.title}`);
        console.log(`   - Estado: ${pendingAssignment.status}`);
        console.log(`   - Vence: ${new Date(pendingAssignment.dueDate).toLocaleString()}`);
        console.log(`   - Cierra: ${new Date(pendingAssignment.closeDate).toLocaleString()}`);

        // 3. Completar la asignación (exactamente como el frontend)
        console.log('\n3️⃣ Completando asignación...');
        
        const completeResponse = await axios.patch(
            `${BASE_URL}/assignments/teacher/${pendingAssignment._id}/complete`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ RESPUESTA COMPLETA DEL SERVIDOR:');
        console.log(JSON.stringify(completeResponse.data, null, 2));

        if (completeResponse.data.success) {
            console.log('\n✅ Asignación completada exitosamente');
            console.log(`   Mensaje: ${completeResponse.data.message}`);
            
            // Verificar la estructura de datos
            if (completeResponse.data.data) {
                console.log(`   Estado de la asignación: ${completeResponse.data.data.status}`);
                console.log(`   Completada el: ${completeResponse.data.data.completedAt || 'N/A'}`);
            } else if (completeResponse.data.assignment) {
                console.log(`   Estado de la asignación: ${completeResponse.data.assignment.status}`);
                console.log(`   Completada el: ${completeResponse.data.assignment.completedAt || 'N/A'}`);
            } else {
                console.log('   ⚠️ Estructura de respuesta no reconocida');
            }
        } else {
            console.log('❌ El servidor reportó un error:', completeResponse.data.error);
        }

        // 4. Verificar el estado actual de la asignación
        console.log('\n4️⃣ Verificando estado actual...');
        const verifyResponse = await axios.get(`${BASE_URL}/assignments/${pendingAssignment._id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📋 Estado verificado:');
        console.log(`   Título: ${verifyResponse.data.data.title}`);
        console.log(`   Estado: ${verifyResponse.data.data.status}`);
        console.log(`   Completada el: ${verifyResponse.data.data.completedAt ? 
            new Date(verifyResponse.data.data.completedAt).toLocaleString() : 'No completada'}`);

        console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');

    } catch (error) {
        console.error('\n❌ ERROR EN LA PRUEBA:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data?.error || error.message);
        console.error('Respuesta completa:', error.response?.data);
    }
}

simulateFrontendCompleteAssignment();
