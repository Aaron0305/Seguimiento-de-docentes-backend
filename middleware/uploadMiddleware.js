import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que el directorio de uploads existe
const uploadDir = 'uploads';
const evidenciasDir = path.join(uploadDir, 'evidencias');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(evidenciasDir)) {
    fs.mkdirSync(evidenciasDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, evidenciasDir);
    },
    filename: (req, file, cb) => {
        // Sanitizar el nombre del archivo original
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Lista de tipos MIME permitidos
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/x-asm',  // Para archivos .asm
        'application/octet-stream' // Para tipos de archivo adicionales
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, DOC, DOCX, JPG, PNG, TXT, ASM y Excel.'), false);
    }
};

// Configuración de multer optimizada
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo (optimizado desde 15MB)
        files: 3, // máximo 3 archivos (optimizado desde 5)
        fieldSize: 1024 * 1024, // 1MB para campos de texto
        fieldNameSize: 50, // máximo 50 caracteres para nombres de campo
        fields: 10 // máximo 10 campos no-file
    }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'El archivo es demasiado grande. El tamaño máximo permitido es 15MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Demasiados archivos. El máximo permitido es 5 archivos.'
            });
        }
    }
    next(err);
};

export { upload, handleMulterError };
