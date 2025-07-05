import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para autenticación general
 * Limita intentos de login, registro, etc.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana de tiempo
  message: {
    error: 'Demasiados intentos de autenticación',
    message: 'Has excedido el límite de intentos. Inténtalo de nuevo en 15 minutos.',
    retryAfter: 15 * 60 // segundos
  },
  standardHeaders: true, // Incluir headers de rate limit
  legacyHeaders: false, // Deshabilitar headers legacy
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de autenticación',
      message: 'Has excedido el límite de intentos. Inténtalo de nuevo en 15 minutos.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Rate limiter específico para recuperación de contraseña
 * Más restrictivo para prevenir spam
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 intentos por hora
  message: {
    error: 'Demasiadas solicitudes de recuperación',
    message: 'Has excedido el límite de solicitudes de recuperación de contraseña. Inténtalo de nuevo en 1 hora.',
    retryAfter: 60 * 60 // segundos
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar IP + email para el rate limiting
    const email = req.body.email || 'unknown';
    return `${req.ip}-${email}`;
  },
  handler: (req, res) => {
    console.log(`🚨 Rate limit excedido para recuperación de contraseña: ${req.ip} - ${req.body.email}`);
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes de recuperación',
      message: 'Has excedido el límite de solicitudes de recuperación de contraseña. Inténtalo de nuevo en 1 hora.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Rate limiter para restablecimiento de contraseña
 * Previene ataques de fuerza bruta en tokens
 */
export const passwordChangeLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos por ventana
  message: {
    error: 'Demasiados intentos de cambio de contraseña',
    message: 'Has excedido el límite de intentos de cambio de contraseña. Inténtalo de nuevo en 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 Rate limit excedido para cambio de contraseña: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de cambio de contraseña',
      message: 'Has excedido el límite de intentos de cambio de contraseña. Inténtalo de nuevo en 15 minutos.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Rate limiter general para la API
 * Protege toda la aplicación
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de solicitudes. Inténtalo de nuevo más tarde.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 Rate limit general excedido: ${req.ip} - ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Inténtalo de nuevo más tarde.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Rate limiter estricto para rutas administrativas
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 requests por ventana
  message: {
    error: 'Demasiadas solicitudes administrativas',
    message: 'Has excedido el límite de solicitudes administrativas. Inténtalo de nuevo en 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 Rate limit administrativo excedido: ${req.ip} - ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes administrativas',
      message: 'Has excedido el límite de solicitudes administrativas. Inténtalo de nuevo en 15 minutos.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Crear un rate limiter personalizado
 * @param {Object} options - Opciones del rate limiter
 * @returns {Function} - Middleware de rate limiter
 */
export const createCustomLimiter = (options) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Inténtalo de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

export default {
  authLimiter,
  passwordResetLimiter,
  passwordChangeLimit,
  generalLimiter,
  adminLimiter,
  createCustomLimiter
};
