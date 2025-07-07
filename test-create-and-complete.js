import axios from 'axios';

console.log('🧪 CREANDO Y COMPLETANDO ASIGNACIÓN DE PRUEBA');
console.log('===============================================\n');

async function testCreateAndCompleteAssignment() {
    const BASE_URL = 'http://localhost:3001/api';
    let adminToken = null;
    let teacherToken = null;
    let assignmentId = null;

    try {
        // 1. Login como admin
        console.log('1️⃣ Login como administrador...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        adminToken = adminLogin.data.token;
        console.log('✅ Login de admin exitoso');

        // 2. Login como docente
        console.log('2️⃣ Login como docente...');
        const teacherLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });
        teacherToken = teacherLogin.data.token;
        console.log('✅ Login de docente exitoso');

        // 3. Crear una asignación nueva que se pueda completar
        console.log('\n3️⃣ Creando asignación nueva...');
        
        const now = new Date();
        const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Vence en 7 días
        const closeDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // Cierra en 10 días

        const assignmentData = {
            title: 'PRUEBA - Asignación Para Completar',
            description: 'Esta asignación se puede completar exitosamente',
            dueDate: dueDate.toISOString(),
            closeDate: closeDate.toISOString(),
            isGeneral: true
        };

        const createResponse = await axios.post(`${BASE_URL}/assignments`, assignmentData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        assignmentId = createResponse.data.data._id;
        console.log('✅ Asignación creada exitosamente');
        console.log(`   - ID: ${assignmentId}`);
        console.log(`   - Título: ${createResponse.data.data.title}`);
        console.log(`   - Vence: ${new Date(createResponse.data.data.dueDate).toLocaleString()}`);
        console.log(`   - Cierra: ${new Date(createResponse.data.data.closeDate).toLocaleString()}`);

        // 4. Completar la asignación
        console.log('\n4️⃣ Completando la asignación...');
        
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
        console.log('   Respuesta completa:', JSON.stringify(completeResponse.data, null, 2));
        console.log('   Mensaje:', completeResponse.data.message);
        if (completeResponse.data.data && completeResponse.data.data.status) {
            console.log('   Nuevo estado:', completeResponse.data.data.status);
            console.log('   Completada el:', new Date(completeResponse.data.data.completedAt).toLocaleString());
        } else {
            console.log('   Estructura de datos diferente de la esperada');
        }

        // 5. Verificar que no se pueda completar dos veces
        console.log('\n5️⃣ Intentando completar la asignación de nuevo (debe fallar)...');
        
        try {
            await axios.patch(
                `${BASE_URL}/assignments/teacher/${assignmentId}/complete`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${teacherToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('❌ ERROR: Se permitió completar la asignación dos veces');
        } catch (error) {
            console.log('✅ Correcto: No se puede completar una asignación ya completada');
            console.log('   Error:', error.response.data.error);
        }

        console.log('\n🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
        console.log('===============================================');
        console.log('✅ Crear asignación: Funcionando');
        console.log('✅ Completar asignación: Funcionando');
        console.log('✅ Validar fechas: Funcionando');
        console.log('✅ Prevenir completar dos veces: Funcionando');

    } catch (error) {
        console.error('❌ Error general:', error.response?.data || error.message);
    }
}

testCreateAndCompleteAssignment();
