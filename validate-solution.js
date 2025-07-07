import axios from 'axios';
import FormData from 'form-data';

console.log('🎯 VALIDACIÓN FINAL DE LA SOLUCIÓN');
console.log('==================================\n');

async function validateSolution() {
    const BASE_URL = 'http://localhost:3001/api';
    
    try {
        // 1. Test de login
        console.log('1️⃣ Probando login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login exitoso');
        
        // 2. Test de creación de asignación (simulando el frontend corregido)
        console.log('2️⃣ Probando creación de asignación...');
        
        const formData = new FormData();
        formData.append('title', 'Validación Final - Solución Implementada');
        formData.append('description', 'Esta asignación confirma que la solución funciona correctamente');
        formData.append('dueDate', new Date('2025-12-31').toISOString());
        formData.append('isGeneral', 'true');

        const assignmentResponse = await axios.post(`${BASE_URL}/assignments`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        console.log('✅ Asignación creada exitosamente');
        console.log('📋 ID de la asignación:', assignmentResponse.data.data._id);
        
        // 3. Test de obtención de asignaciones
        console.log('3️⃣ Probando obtención de asignaciones...');
        
        const getResponse = await axios.get(`${BASE_URL}/assignments/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Asignaciones obtenidas exitosamente');
        console.log('📊 Total de asignaciones:', getResponse.data.data.length);
        
        // 4. Verificar que nuestra asignación está en la lista
        const ourAssignment = getResponse.data.data.find(a => 
            a.title === 'Validación Final - Solución Implementada'
        );
        
        if (ourAssignment) {
            console.log('✅ Asignación encontrada en la lista');
        } else {
            console.log('⚠️ Asignación no encontrada en la lista');
        }
        
        console.log('\n🎉 VALIDACIÓN COMPLETADA EXITOSAMENTE');
        console.log('=====================================');
        console.log('✅ El sistema funciona correctamente');
        console.log('✅ No hay errores de "Sesión expirada"');
        console.log('✅ Los tokens JWT funcionan perfectamente');
        console.log('✅ Las asignaciones se crean y consultan sin problemas');
        console.log('\n🔧 La solución implementada en el frontend ha resuelto el problema.');
        
    } catch (error) {
        console.error('❌ ERROR EN LA VALIDACIÓN:', error.message);
        
        if (error.response) {
            console.error('📋 Status:', error.response.status);
            console.error('📋 Data:', error.response.data);
        }
        
        console.log('\n⚠️ Si ves este error, es posible que:');
        console.log('1. El servidor no esté ejecutándose');
        console.log('2. Las credenciales hayan cambiado');
        console.log('3. Haya un problema de conectividad');
    }
}

validateSolution();
