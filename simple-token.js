import jwt from 'jsonwebtoken';

// Crear un token simple con la misma clave que usa el servidor
const payload = {
    id: '686adb66894909cadb9449bf'
};

const token = jwt.sign(payload, 'tu_jwt_secret', { expiresIn: '7d' });

console.log('✅ Token generado:');
console.log(token);

// Verificar que el token es válido
try {
    const decoded = jwt.verify(token, 'tu_jwt_secret');
    console.log('✅ Token válido, decoded:', decoded);
} catch (error) {
    console.log('❌ Token inválido:', error.message);
}
