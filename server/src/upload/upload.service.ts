import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure:     true,
    });
  }

  /** Upload a single image buffer to Cloudinary */
  uploadFile(buffer: Buffer, folder = 'kosres/properties'): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1400, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (err, result) => {
          if (err || !result) return reject(new InternalServerErrorException(`Cloudinary upload failed: ${err?.message}`));
          resolve({ url: result.url, secureUrl: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, format: result.format, bytes: result.bytes });
        },
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  /** Upload multiple images in parallel */
  async uploadFiles(files: Express.Multer.File[], folder = 'kosres/properties'): Promise<CloudinaryUploadResult[]> {
    return Promise.all(files.map(f => this.uploadFile(f.buffer, folder)));
  }

  /** Upload a raw file (PDF, etc.) to Cloudinary as resource_type: raw */
  uploadRaw(buffer: Buffer, originalName: string, folder = 'kosres/documents'): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'raw', public_id: `${Date.now()}-${originalName}` },
        (err, result) => {
          if (err || !result) return reject(new InternalServerErrorException(`Cloudinary upload failed: ${err?.message}`));
          resolve({ url: result.url, secureUrl: result.secure_url, publicId: result.public_id, format: result.format, bytes: result.bytes });
        },
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  /** Delete an asset by public_id */
  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  /** Signed upload params for direct browser → Cloudinary uploads */
  generateSignedUploadParams(folder = 'kosres/properties') {
    const timestamp    = Math.round(Date.now() / 1000);
    const paramsToSign = { folder, timestamp };
    const signature    = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);
    return { timestamp, signature, folder, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME };
  }
}
