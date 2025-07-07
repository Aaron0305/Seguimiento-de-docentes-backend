import fetch from 'node-fetch';

async function debugSessionIssue() {
    console.log('🔍 === DEBUGGING SESSION EXPIRED ISSUE ===\n');
    
    try {
        // Paso 1: Login exitoso
        console.log('1. Haciendo login...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@test-api.com',
                password: 'test123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (!loginData.success) {
            console.log('❌ Login falló:', loginData.message);
            return;
        }

        console.log('✅ Login exitoso');
        const token = loginData.token;
        console.log('Token obtenido (primeros 50 chars):', token.substring(0, 50));

        // Paso 2: Verificar que el token funciona
        console.log('\n2. Verificando que el token funciona...');
        const verifyResponse = await fetch('http://localhost:3001/api/assignments/auth-status', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const verifyData = await verifyResponse.json();
        console.log('Verificación:', verifyData);

        // Paso 3: Intentar crear asignación (simulando frontend exacto)
        console.log('\n3. Creando asignación (simulando frontend)...');
        
        // Simulando exactamente lo que hace el frontend
        const assignmentData = {
            title: 'Asignación de Prueba 2',
            description: 'es una prueba',
            dueDate: '2025-07-07T16:44:00.000Z',
            isGeneral: true
        };

        const createResponse = await fetch('http://localhost:3001/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(assignmentData)
        });

        console.log('Status de creación:', createResponse.status);
        const createData = await createResponse.json();
        console.log('Respuesta de creación:', createData);

        // Paso 4: Probar sin token para ver el mensaje de error
        console.log('\n4. Probando sin token (para ver mensaje de error)...');
        const noTokenResponse = await fetch('http://localhost:3001/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Sin Authorization header
            },
            body: JSON.stringify(assignmentData)
        });

        const noTokenData = await noTokenResponse.json();
        console.log('Sin token - Status:', noTokenResponse.status);
        console.log('Sin token - Respuesta:', noTokenData);

        // Paso 5: Probar con token malformado
        console.log('\n5. Probando con token malformado...');
        const badTokenResponse = await fetch('http://localhost:3001/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token_invalido'
            },
            body: JSON.stringify(assignmentData)
        });

        const badTokenData = await badTokenResponse.json();
        console.log('Token malo - Status:', badTokenResponse.status);
        console.log('Token malo - Respuesta:', badTokenData);

    } catch (error) {
        console.error('❌ Error durante debug:', error);
    }
}

debugSessionIssue();
