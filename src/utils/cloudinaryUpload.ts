// ./src/utils/cloudinaryUpload.ts

'use strict';

import cloudinary from '../config/cloudinary';
import type { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import streamifier from 'streamifier';

export type CloudinaryUploadInput = {
  buffer: Buffer;
  folder: string;
  publicId: string;
  displayName: string;
  overwrite?: boolean;
};

export const uploadToCloudinary = (input: CloudinaryUploadInput): Promise<UploadApiResponse> => {
  const { buffer, folder, publicId, displayName, overwrite } = input;

  const options: UploadApiOptions = {
    folder,
    public_id: publicId,
    display_name: displayName,
    resource_type: 'image',
    overwrite: overwrite ?? false,
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      if (!result) return reject(new Error('Cloudinary returned empty result'));
      return resolve(result as UploadApiResponse);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
