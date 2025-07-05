import rateLimit from 'express-rate-limit';

// Configuración general del rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 solicitudes por ventana por IP
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos'
    },
    standardHeaders: true, // Devuelve los headers de rate limit info
    legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
});

// Configuración específica para autenticación
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Límite de 5 intentos por hora
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor, intente de nuevo después de una hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 