import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Modelos
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellidoPaterno: {
        type: String,
        required: true,
        trim: true
    },
    apellidoMaterno: {
        type: String,
        required: true,
        trim: true
    },
    numeroControl: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    rol: {
        type: String,
        required: true,
        enum: ['admin', 'docente']
    },
    carrera: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carrera',
        required: true
    },
    semestre: {
        type: Number,
        required: true,
        min: 1,
        max: 9
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    profilePicture: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const User = mongoose.model('User', UserSchema);

async function checkUserPassword() {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb://localhost:27017/seguimiento-docentes');
        console.log('✅ Conectado a MongoDB');

        // Listar todos los usuarios para verificar
        const allUsers = await User.find({}, 'email nombre apellidoPaterno rol');
        console.log('👥 Todos los usuarios:');
        allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} - ${user.nombre} ${user.apellidoPaterno} - ${user.rol}`);
        });

        // Buscar el usuario específico que aparece en nuestra lista
        const userEmails = [
            'profesor@test.com',
            'docente@test-api.com',
            'andreslopezpina187@gmail.com',
            'prodiggigameplays@gmail.com'
        ];

        for (const email of userEmails) {
            const user = await User.findOne({ email });
            if (user) {
                console.log(`\n👤 Usuario encontrado: ${email}`);
                console.log('🔐 Probando contraseñas...');
                
                const commonPasswords = ['123456', 'password123', 'profesor123', 'test123', 'admin123'];
                
                for (const password of commonPasswords) {
                    try {
                        const isMatch = await bcrypt.compare(password, user.password);
                        if (isMatch) {
                            console.log(`✅ Contraseña correcta para ${email}: "${password}"`);
                            return { email, password };
                        }
                    } catch (error) {
                        // Ignorar errores de bcrypt
                    }
                }
                
                console.log(`❌ No se encontró contraseña para ${email}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

checkUserPassword();
