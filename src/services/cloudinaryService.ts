// /src/services/cloudinaryService.ts
import cloudinary from '../config/cloudinary';

/**
 * Uploads an image buffer to Cloudinary.
 * @param buffer - Image buffer from multer memory storage.
 * @param filename - Suggested file name (for folder organization).
 * @returns Promise<{ url: string; public_id: string; }>
 */
export const uploadImageBuffer = async (
  buffer: Buffer,
  filename: string
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars', // Store under /avatars/ in Cloudinary
        public_id: filename,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          {
            width: 320,
            height: 320,
            crop: 'thumb',
            gravity: 'face',
            quality: 80,
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};
