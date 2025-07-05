# 🚀 PASOS FINALES PARA ACTIVAR GMAIL

## ✅ Lo que ya está listo:
- ✅ Código de recuperación de contraseña implementado (frontend y backend)
- ✅ Servicio de email configurado para Gmail
- ✅ Variables de entorno preparadas
- ✅ Script de prueba creado

## 🔧 Lo que necesitas hacer:

### 1. Configurar tu cuenta de Gmail

**Paso 1.1: Activa la verificación en 2 pasos**
1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos" y actívala
3. Configura SMS, app autenticadora, etc.

**Paso 1.2: Genera una contraseña de aplicación**
1. En la misma página de seguridad, busca "Contraseñas de aplicaciones"
2. Selecciona "Correo" > "Otro (nombre personalizado)"
3. Nombre: "Sistema Seguimiento Docentes"
4. **GUARDA LA CONTRASEÑA** de 16 caracteres que aparece

### 2. Editar el archivo .env

Abre el archivo `.env` y reemplaza:

```env
EMAIL_FROM=INGRESA_TU_EMAIL@gmail.com
EMAIL_USER=INGRESA_TU_EMAIL@gmail.com
EMAIL_PASSWORD=INGRESA_TU_APP_PASSWORD_AQUI
```

**Con tus datos reales**, ejemplo:
```env
EMAIL_FROM=maria.lopez@gmail.com
EMAIL_USER=maria.lopez@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 3. Probar la configuración

**Paso 3.1: Prueba básica**
```bash
cd server/Seguimiento-de-docentes-backend
npm run test-gmail
```

**Paso 3.2: Si la prueba es exitosa, inicia el servidor**
```bash
npm run dev
```

**Paso 3.3: Prueba el flujo completo**
1. Ve a: http://localhost:5173
2. Click en "Iniciar Sesión"
3. Click en "¿Olvidaste tu contraseña?"
4. Ingresa un email registrado en el sistema
5. Verifica que llegue el correo

### 4. Usuarios de prueba

Para probar, necesitas un usuario registrado. Si no tienes, puedes:

1. **Registrar un nuevo usuario** en la aplicación
2. **O usar el siguiente comando** para crear uno directo en la base de datos:

```bash
# Conectarse a MongoDB
mongo mongodb://localhost:27017/medidor

# Crear usuario de prueba
db.users.insertOne({
  name: "Usuario Prueba",
  email: "TU_EMAIL@gmail.com",
  password: "$2b$10$example_hash_password",
  role: "teacher",
  createdAt: new Date()
})
```

## 🆘 Solución de problemas

**❌ Error de autenticación:**
- Verifica que la verificación en 2 pasos esté activada
- Regenera la contraseña de aplicación
- Asegúrate de no tener espacios extra al copiar

**❌ No llega el correo:**
- Revisa la carpeta de spam
- Verifica que el email esté registrado en el sistema
- Checa los logs del servidor

**❌ Error de conexión:**
- Verifica tu conexión a internet
- Asegúrate de que Gmail no esté bloqueado por firewall

## 📞 ¿Necesitas ayuda?

Si encuentras problemas:

1. **Ejecuta el script de prueba**: `npm run test-gmail`
2. **Revisa los logs** del servidor
3. **Verifica las variables** del archivo `.env`
4. **Consulta**: `GMAIL_SETUP.md` para más detalles

---

**Una vez configurado, ¡el sistema estará listo para producción!** 🎉
