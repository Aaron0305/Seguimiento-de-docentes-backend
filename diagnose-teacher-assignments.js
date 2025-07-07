import axios from 'axios';

console.log('🔍 DIAGNOSTICANDO PROBLEMA DE ASIGNACIONES DE DOCENTES');
console.log('====================================================\n');

async function diagnoseDoctorAssignments() {
    const BASE_URL = 'http://localhost:3001/api';

    try {
        // 1. Login como docente
        console.log('1️⃣ Login como docente...');
        const teacherLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });
        
        const token = teacherLogin.data.token;
        console.log('✅ Login exitoso');
        console.log('📋 Datos del usuario:', teacherLogin.data.user);

        // 2. Verificar el endpoint getUserAssignments
        console.log('\n2️⃣ Probando endpoint getUserAssignments...');
        try {
            const userAssignments = await axios.get(`${BASE_URL}/assignments/my-assignments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ getUserAssignments funciona');
            console.log(`📊 Total asignaciones: ${userAssignments.data.total || 0}`);
            console.log(`📋 Asignaciones encontradas: ${userAssignments.data.assignments?.length || 0}`);
            
            if (userAssignments.data.assignments?.length > 0) {
                console.log('\n📝 Primeras 3 asignaciones:');
                userAssignments.data.assignments.slice(0, 3).forEach((assignment, index) => {
                    console.log(`   ${index + 1}. ${assignment.title}`);
                    console.log(`      - Estado: ${assignment.status}`);
                    console.log(`      - Asignada a: ${assignment.assignedTo?.length || 0} docentes`);
                    console.log(`      - Es general: ${assignment.isGeneral}`);
                });
            }
        } catch (error) {
            console.log('❌ Error en getUserAssignments:', error.response?.data?.error || error.message);
        }

        // 3. Verificar el endpoint getTeacherFilteredAssignments
        console.log('\n3️⃣ Probando endpoint getTeacherFilteredAssignments...');
        try {
            const teacherAssignments = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ getTeacherFilteredAssignments funciona');
            console.log(`📊 Total asignaciones: ${teacherAssignments.data.pagination?.total || 0}`);
            console.log(`📋 Asignaciones en esta página: ${teacherAssignments.data.assignments?.length || 0}`);
            
            if (teacherAssignments.data.assignments?.length > 0) {
                console.log('\n📝 Primeras 3 asignaciones:');
                teacherAssignments.data.assignments.slice(0, 3).forEach((assignment, index) => {
                    console.log(`   ${index + 1}. ${assignment.title}`);
                    console.log(`      - Estado: ${assignment.status}`);
                    console.log(`      - Vence: ${new Date(assignment.dueDate).toLocaleDateString()}`);
                    console.log(`      - Cierra: ${new Date(assignment.closeDate).toLocaleDateString()}`);
                });
            }
        } catch (error) {
            console.log('❌ Error en getTeacherFilteredAssignments:', error.response?.data?.error || error.message);
        }

        // 4. Verificar cuántas asignaciones hay en total
        console.log('\n4️⃣ Verificando asignaciones en la base de datos...');
        try {
            const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'admin@test.com',
                password: 'admin123'
            });
            
            const adminToken = adminLogin.data.token;
            const allAssignments = await axios.get(`${BASE_URL}/assignments`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`📊 Total asignaciones en el sistema: ${allAssignments.data.total || 0}`);
            
            if (allAssignments.data.assignments?.length > 0) {
                console.log('\n📝 Análisis de asignaciones:');
                
                let generalCount = 0;
                let specificCount = 0;
                let assignedToTeacher = 0;
                
                const teacherId = teacherLogin.data.user._id;
                
                allAssignments.data.assignments.forEach(assignment => {
                    if (assignment.isGeneral) {
                        generalCount++;
                    } else {
                        specificCount++;
                    }
                    
                    // Verificar si el docente está asignado
                    const isAssigned = assignment.assignedTo.some(user => 
                        user._id === teacherId || user === teacherId
                    );
                    
                    if (isAssigned) {
                        assignedToTeacher++;
                    }
                });
                
                console.log(`   - Asignaciones generales: ${generalCount}`);
                console.log(`   - Asignaciones específicas: ${specificCount}`);
                console.log(`   - Asignadas al docente actual: ${assignedToTeacher}`);
                console.log(`   - ID del docente: ${teacherId}`);
            }
            
        } catch (error) {
            console.log('❌ Error verificando todas las asignaciones:', error.response?.data?.error || error.message);
        }

        // 5. Verificar estadísticas del docente
        console.log('\n5️⃣ Verificando estadísticas del docente...');
        try {
            const stats = await axios.get(`${BASE_URL}/assignments/teacher/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Estadísticas obtenidas:');
            console.log('📊 Stats:', JSON.stringify(stats.data.stats, null, 2));
            
        } catch (error) {
            console.log('❌ Error obteniendo estadísticas:', error.response?.data?.error || error.message);
        }

    } catch (error) {
        console.error('❌ Error general:', error.response?.data?.error || error.message);
    }
}

diagnoseDoctorAssignments();
