// The-Human-Tech-Blog-Server/src/services/cloudinaryService.ts
'use strict';

import cloudinary from '../config/cloudinary';

export type UploadImageBufferArgs = {
  buffer: Buffer;
  filename?: string;
  folder?: string;

  // New: explicit naming control
  publicId?: string;
  displayName?: string;
};

export type UploadImageBufferResult = {
  url: string;

  // Keep both shapes to avoid breaking older code
  public_id: string;
  publicId: string;

  displayName: string;
};

export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string
): Promise<UploadImageBufferResult>;
export async function uploadImageBuffer(
  args: UploadImageBufferArgs
): Promise<UploadImageBufferResult>;

export async function uploadImageBuffer(
  arg1: Buffer | UploadImageBufferArgs,
  arg2?: string
): Promise<UploadImageBufferResult> {
  const isBuf = Buffer.isBuffer(arg1);

  const buffer: Buffer = isBuf ? arg1 : arg1.buffer;

  const folder: string = isBuf ? 'avatars' : (arg1.folder ?? 'avatars');

  const filename: string = isBuf ? (arg2 ?? '') : (arg1.filename ?? '');

  const publicId: string = isBuf ? filename : (arg1.publicId ?? filename);
  const displayNameInput: string = isBuf ? filename : (arg1.displayName ?? publicId);

  if (!publicId.trim()) {
    throw new Error('uploadImageBuffer requires publicId or filename');
  }

  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {
      folder,
      public_id: publicId,
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
    };

    // Cloudinary supports display_name, but types can lag behind
    if (displayNameInput.trim()) {
      options.display_name = displayNameInput.trim();
    }

    const stream = cloudinary.uploader.upload_stream(options as any, (error, result) => {
      if (error || !result) {
        return reject(error ?? new Error('Cloudinary upload returned no result'));
      }

      const r = result as unknown as {
        secure_url: string;
        public_id: string;
        display_name?: string;
      };

      const displayName = (r.display_name ?? displayNameInput ?? publicId).trim();

      return resolve({
        url: r.secure_url,
        public_id: r.public_id,
        publicId: r.public_id,
        displayName,
      });
    });

    stream.end(buffer);
  });
}
