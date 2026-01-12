// src/services/cloudinaryService.ts
'use strict';

import cloudinary from '../config/cloudinary';

export type UploadImageBufferArgs = {
  buffer: Buffer;
  filename: string;
  folder?: string;
};

export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string
): Promise<{ url: string; public_id: string }>;
export async function uploadImageBuffer(
  args: UploadImageBufferArgs
): Promise<{ url: string; public_id: string }>;

export async function uploadImageBuffer(
  arg1: Buffer | UploadImageBufferArgs,
  arg2?: string
): Promise<{ url: string; public_id: string }> {
  const isBuf = Buffer.isBuffer(arg1);

  const buffer: Buffer = isBuf ? arg1 : arg1.buffer;
  const filename: string = isBuf ? (arg2 ?? '') : arg1.filename;
  const folder: string = isBuf ? 'avatars' : (arg1.folder ?? 'avatars');

  if (!filename.trim()) {
    throw new Error('uploadImageBuffer requires a filename');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
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
        if (error || !result) {
          return reject(error ?? new Error('Cloudinary upload returned no result'));
        }
        return resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );

    stream.end(buffer);
  });
}
