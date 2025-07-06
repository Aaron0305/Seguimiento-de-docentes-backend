// Script simple para probar la autenticación
const testAuth = async () => {
    try {
        // Intentar verificar si hay usuarios en la base de datos
        const response = await fetch('http://localhost:3001/api/auth/verify', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('🔍 Respuesta de verificación sin token:', response.status);
        
        // Intentar login con credenciales de prueba
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });

        const loginData = await loginResponse.json();
        console.log('📋 Respuesta de login:', loginData);

        if (loginResponse.ok && loginData.token) {
            console.log('✅ Login exitoso, token:', loginData.token.substring(0, 20) + '...');
            
            // Probar verificación con token
            const verifyResponse = await fetch('http://localhost:3001/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            
            const verifyData = await verifyResponse.json();
            console.log('🔐 Verificación con token:', verifyData);
        } else {
            console.log('❌ Login falló:', loginData.message);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

testAuth();
