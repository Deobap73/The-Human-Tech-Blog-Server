// ./src/services/cloudinaryService.ts

'use strict';

import type { UploadApiResponse } from 'cloudinary';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

export type UploadImageOptions = {
  buffer: Buffer;
  folder: string;
  publicId: string;
  displayName: string;
};

export type UploadImageResult = {
  url: string;
  publicId: string;
  displayName: string;
};

export async function uploadImageBuffer(options: UploadImageOptions): Promise<UploadImageResult> {
  const result: UploadApiResponse = await uploadToCloudinary({
    buffer: options.buffer,
    folder: options.folder,
    publicId: options.publicId,
    displayName: options.displayName,
    overwrite: false,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    displayName:
      (result as unknown as { display_name?: string }).display_name ?? options.displayName,
  };
}
