// src/utils/cloudinaryUpload.ts
'use strict';

import cloudinary from '../config/cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

export type CloudinaryUploadArgs = {
  buffer: Buffer;
  folder?: string;
  publicId?: string;
  displayName?: string;
  resourceType?: UploadApiOptions['resource_type'];
  overwrite?: boolean;
};

export function uploadToCloudinary(buffer: Buffer, folder?: string): Promise<UploadApiResponse>;
export function uploadToCloudinary(args: CloudinaryUploadArgs): Promise<UploadApiResponse>;

export function uploadToCloudinary(
  arg1: Buffer | CloudinaryUploadArgs,
  arg2?: string
): Promise<UploadApiResponse> {
  const isBuf = Buffer.isBuffer(arg1);

  const buffer: Buffer = isBuf ? arg1 : arg1.buffer;
  const folder: string = isBuf ? (arg2 ?? 'posts') : (arg1.folder ?? 'posts');

  const options: UploadApiOptions = {
    folder,
    resource_type: isBuf ? 'auto' : (arg1.resourceType ?? 'auto'),
    overwrite: isBuf ? true : (arg1.overwrite ?? true),
  };

  if (!isBuf) {
    if (arg1.publicId) options.public_id = arg1.publicId;
    if (arg1.displayName)
      (options as unknown as { display_name?: string }).display_name = arg1.displayName;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      if (!result) return reject(new Error('Cloudinary upload returned no result'));
      return resolve(result as UploadApiResponse);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
}
