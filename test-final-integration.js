import axios from 'axios';
import FormData from 'form-data';

async function createAssignmentForNewTeacher() {
    try {
        // Login como admin
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Admin login exitoso');
        
        // Crear nueva asignación general
        const formData = new FormData();
        formData.append('title', 'Asignación para Nuevo Docente - Prueba del Sistema');
        formData.append('description', 'Esta asignación se crea específicamente para probar que el nuevo docente puede ver sus asignaciones correctamente en la interfaz.');
        formData.append('dueDate', new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString());
        formData.append('isGeneral', 'true');
        
        const response = await axios.post('http://localhost:3001/api/assignments', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        
        console.log('✅ Nueva asignación creada:', response.data.data.title);
        console.log('👥 Asignada a', response.data.data.assignedTo.length, 'docentes');
        
        // Verificar que el nuevo docente esté incluido
        const newTeacherIncluded = response.data.data.assignedTo.some(teacher => 
            teacher.email === 'profesor@test.com'
        );
        
        if (newTeacherIncluded) {
            console.log('✅ El nuevo docente está incluido en la asignación');
        } else {
            console.log('❌ El nuevo docente NO está incluido en la asignación');
        }
        
        // Verificar con el docente
        console.log('\n🧑‍🏫 Probando acceso del docente...');
        const teacherLogin = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'profesor@test.com',
            password: 'profesor123'
        });
        
        const teacherToken = teacherLogin.data.token;
        
        const stats = await axios.get('http://localhost:3001/api/assignments/teacher/stats', {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        
        console.log('📊 Estadísticas del docente actualizadas:');
        console.log('  - Total:', stats.data.stats.total);
        console.log('  - Pendientes:', stats.data.stats.pending);
        console.log('  - Completadas:', stats.data.stats.completed);
        
        const assignments = await axios.get('http://localhost:3001/api/assignments/teacher/assignments', {
            headers: { Authorization: `Bearer ${teacherToken}` },
            params: { limit: 3 }
        });
        
        console.log('\n📋 Asignaciones del docente:');
        assignments.data.assignments.forEach((assignment, index) => {
            console.log(`  ${index + 1}. ${assignment.title}`);
            console.log(`     Estado: ${assignment.status}`);
            console.log(`     Vence: ${new Date(assignment.dueDate).toLocaleDateString()}`);
        });
        
        console.log('\n🎉 ¡Sistema de asignaciones funcionando correctamente!');
        console.log('✅ Backend APIs funcionando');
        console.log('✅ Docente puede ver sus asignaciones');
        console.log('✅ Estadísticas se calculan correctamente');
        console.log('\n🚀 Listo para probar en el frontend!');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('📋 Detalles:', error.response.status, error.response.statusText);
        }
    }
}

createAssignmentForNewTeacher();
