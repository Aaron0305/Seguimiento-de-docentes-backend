import rateLimit from 'express-rate-limit';

// Configuración general del rate limiter optimizada
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite optimizado a 100 solicitudes por ventana por IP (desde 10000)
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos'
    },
    standardHeaders: true, // Devuelve los headers de rate limit info
    legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
    skipSuccessfulRequests: false, // Contar todas las solicitudes
    skipFailedRequests: false, // Contar solicitudes fallidas también
});

// Configuración específica para autenticación optimizada
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Límite estricto de 5 intentos por hora para seguridad (desde 100)
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor, intente de nuevo después de una hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar intentos exitosos
    skipFailedRequests: false, // Contar solo intentos fallidos
}); 