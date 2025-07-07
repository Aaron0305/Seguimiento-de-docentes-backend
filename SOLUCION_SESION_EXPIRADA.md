# 🔧 SOLUCIÓN al Error "Sesión expirada. Por favor, inicia sesión nuevamente."

## 📋 Diagnóstico Completado

### ✅ Backend funcionando correctamente:
- ✅ Autenticación JWT funciona
- ✅ Middleware de autenticación funciona
- ✅ Creación de asignaciones funciona
- ✅ Tokens válidos son aceptados
- ✅ Tokens inválidos son rechazados con mensajes apropiados

### 🔍 Mensajes de Error del Backend:
1. **Sin Authorization header**: "No hay token de autorización"
2. **Token inválido/expirado**: "Token inválido o expirado"  
3. **Usuario no encontrado**: "Usuario no encontrado"
4. **Formato incorrecto**: "Sesión expirada. Por favor, inicia sesión nuevamente."

## 🎯 El Problema está en el Frontend

El mensaje **"Sesión expirada. Por favor, inicia sesión nuevamente."** indica que:

### 🔴 Posibles Causas:

1. **Token no se está enviando desde el frontend**
   - LocalStorage no contiene el token
   - El token no se incluye en el header Authorization
   - Error en la configuración de axios/fetch

2. **Token con formato incorrecto**
   - Falta el prefijo "Bearer "
   - Token mal formateado

3. **Token realmente expirado**
   - El token fue generado hace más de 7 días
   - JWT_SECRET cambió después de generar el token

## 🛠️ Soluciones para el Frontend

### 1. Verificar que el token se guarde correctamente después del login

```javascript
// En el componente de login
const handleLogin = async (credentials) => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      // IMPORTANTE: Guardar el token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      console.log('✅ Token guardado:', data.token.substring(0, 50));
    }
  } catch (error) {
    console.error('Error en login:', error);
  }
};
```

### 2. Verificar que el token se envíe en todas las peticiones

```javascript
// Configuración de axios (recomendado)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token enviado:', token.substring(0, 50));
    } else {
      console.log('❌ No hay token disponible');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Usar api en lugar de fetch
const createAssignment = async (assignmentData) => {
  try {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data);
    throw error;
  }
};
```

### 3. Si usas fetch directamente

```javascript
// Función helper para peticiones autenticadas
const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  console.log('🔑 Enviando con token:', token.substring(0, 50));
  
  return fetch(`http://localhost:3001/api${url}`, {
    ...options,
    headers
  });
};

// Uso:
const createAssignment = async (assignmentData) => {
  const response = await authenticatedFetch('/assignments', {
    method: 'POST',
    body: JSON.stringify(assignmentData)
  });
  
  return response.json();
};
```

### 4. Para formularios con archivos (FormData)

```javascript
const createAssignmentWithFiles = async (formData) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  // NO incluir Content-Type para FormData
  const response = await fetch('http://localhost:3001/api/assignments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // NO poner Content-Type aquí
    },
    body: formData
  });
  
  return response.json();
};
```

## 🔍 Debug en el Frontend

### Agregar logs para verificar el token:

```javascript
// Verificar que el token esté presente
const checkAuth = () => {
  const token = localStorage.getItem('authToken');
  console.log('🔍 Token check:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 50),
    userRole: localStorage.getItem('userRole')
  });
  
  return !!token;
};

// Llamar antes de hacer peticiones
if (!checkAuth()) {
  // Redirigir a login
  window.location.href = '/login';
  return;
}
```

## 🎯 Credenciales de Prueba para Testing

```javascript
// Usar estas credenciales para probar
const testCredentials = {
  admin: {
    email: 'admin@test-api.com',
    password: 'test123'
  },
  docente: {
    email: 'docente@test-api.com', 
    password: 'test123'
  }
};
```

## 📞 URLs del Backend (Puerto 3001)

```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify', 
    ASSIGNMENTS: '/assignments',
    MY_ASSIGNMENTS: '/assignments/my-assignments',
    DASHBOARD_STATS: '/assignments/dashboard-stats'
  }
};
```

## ✅ Verificación Final

1. **Verificar que el login guarde el token**
2. **Verificar que las peticiones incluyan `Authorization: Bearer <token>`**
3. **Verificar que no hay errores de CORS**
4. **Verificar que el JWT_SECRET no haya cambiado**

**El backend está 100% funcional. El problema está en cómo el frontend maneja la autenticación.**
