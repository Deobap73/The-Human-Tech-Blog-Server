// The-Human-Tech-Blog-Server/src/utils/cloudinaryUpload.ts
import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

export const uploadToCloudinary = (buffer: Buffer, folder = 'posts'): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result as UploadApiResponse);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
};