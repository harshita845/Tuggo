import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';

// Ensure the base upload directory and standard subdirectories exist
const baseUploadDir = config.uploadPath || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
}

const ensureDirExists = (subfolder) => {
    const dir = path.join(baseUploadDir, subfolder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

// Create required folders on startup
['images', 'videos', 'documents'].forEach(folder => ensureDirExists(folder));

// Multer memory storage
const storage = multer.memoryStorage();

// File filter (from SOP: jpeg, png, webp, gif)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
    }
};

// Multer middleware: max 5MB (from SOP) for specific image endpoints
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter
});

/**
 * Processes and saves an image buffer to the given folder.
 * Returns the relative public path (e.g., '/uploads/foods/food_123.webp')
 */
const processAndSaveImage = async ({ buffer, folder, prefix, width, height, quality = 80 }) => {
    const dir = ensureDirExists(folder);
    const filename = `${prefix}_${uuidv4().replace(/-/g, '').substring(0, 10)}.webp`;
    const filepath = path.join(dir, filename);

    let sharpInstance = sharp(buffer);
    
    if (width || height) {
        sharpInstance = sharpInstance.resize({
            width,
            height,
            fit: 'inside', // To maintain aspect ratio and fit within max dimensions
            withoutEnlargement: true
        });
    }

    await sharpInstance
        .webp({ quality })
        .toFile(filepath);

    // This path is what will be stored in DB and served by Express/Nginx
    return `/uploads/${folder}/${filename}`;
};

/**
 * Exported specific processing functions as per SOP
 */

export const uploadFoodImage = async (buffer) => {
    return processAndSaveImage({
        buffer,
        folder: 'foods',
        prefix: 'food',
        width: 800,
        height: 800,
        quality: 85
    });
};

export const uploadRestaurantImage = async (buffer) => {
    return processAndSaveImage({
        buffer,
        folder: 'restaurants',
        prefix: 'restaurant',
        width: 1200,
        height: 800,
        quality: 85
    });
};

export const uploadBannerImage = async (buffer) => {
    return processAndSaveImage({
        buffer,
        folder: 'banners',
        prefix: 'banner',
        width: 1600,
        height: 600,
        quality: 85
    });
};

export const uploadProfileImage = async (buffer) => {
    return processAndSaveImage({
        buffer,
        folder: 'users',
        prefix: 'user',
        width: 400,
        height: 400,
        quality: 85
    });
};

export const uploadDeliveryImage = async (buffer) => {
    return processAndSaveImage({
        buffer,
        folder: 'delivery',
        prefix: 'delivery',
        width: 800,
        height: 800,
        quality: 85
    });
};

export const uploadGenericImage = async (buffer, folder = 'misc') => {
    return processAndSaveImage({
        buffer,
        folder,
        prefix: 'img',
        quality: 85
    });
};

export const uploadFileBuffer = async (buffer, folder = 'misc', options = {}) => {
    // For non-image files (like PDFs) that we used to upload via uploadFileBuffer
    const dir = ensureDirExists(folder);
    const prefix = options.fileName ? options.fileName.split('.')[0] : 'file';
    const ext = options.format ? `.${options.format}` : '.bin';
    const filename = `${prefix}_${uuidv4().replace(/-/g, '').substring(0, 10)}${ext}`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, buffer);
    return `/uploads/${folder}/${filename}`;
};

export const uploadVideoBuffer = async (buffer, folder = 'videos', options = {}) => {
    const dir = ensureDirExists(folder);
    const filename = `video_${uuidv4().replace(/-/g, '').substring(0, 10)}.mp4`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${folder}/${filename}`;
};

export const buildRawDownloadUrlFromFileUrl = (fileUrl, options = {}) => {
    // Simply return the relative path
    return fileUrl;
};

// --- Generic Production-Ready File Upload System ---

const genericStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let subfolder = 'misc';
        const mime = file.mimetype;
        if (mime.startsWith('image/')) subfolder = 'images';
        else if (mime.startsWith('video/')) subfolder = 'videos';
        else if (mime === 'application/pdf') subfolder = 'documents';
        
        const dir = path.join(baseUploadDir, subfolder);
        // ensure dir just in case
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname) || '';
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${name}_${uniqueSuffix}${ext}`);
    }
});

const genericFileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm',
        'application/pdf'
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only images, videos, and PDFs are supported.`), false);
    }
};

export const genericUpload = multer({
    storage: genericStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: genericFileFilter
});
