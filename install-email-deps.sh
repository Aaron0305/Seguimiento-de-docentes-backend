#!/bin/bash

echo "🚀 Instalando dependencias para la funcionalidad de recuperación de contraseña..."

# Navegar al directorio del servidor
cd "$(dirname "$0")"

# Instalar dependencias nuevas
echo "📦 Instalando dependencias de Node.js..."
npm install nodemailer@^6.9.8 handlebars@^4.7.8 express-rate-limit@^7.1.5

# Verificar instalación
echo "✅ Verificando instalación..."
node -e "
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const rateLimit = require('express-rate-limit');
console.log('✅ nodemailer:', nodemailer.createTransporter ? 'OK' : 'ERROR');
console.log('✅ handlebars:', handlebars.compile ? 'OK' : 'ERROR');
console.log('✅ express-rate-limit:', rateLimit ? 'OK' : 'ERROR');
"

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Copia .env.example a .env"
echo "2. Configura las variables de email en .env"
echo "3. Reinicia el servidor con 'npm run dev'"
echo ""
echo "📖 Para más información, consulta EMAIL_CONFIGURATION.md"
