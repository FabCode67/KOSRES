import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
      api_key:     process.env.CLOUDINARY_API_KEY,
      api_secret:  process.env.CLOUDINARY_API_SECRET,
      secure:      true,
    });
  }

  /**
   * Upload a single file buffer to Cloudinary.
   * Returns the secure HTTPS URL and metadata.
   */
  uploadFile(
    buffer: Buffer,
    folder = 'kosres/properties',
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            // Resize to max 1400px wide, maintain aspect ratio, auto quality
            { width: 1400, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${error?.message || 'unknown error'}`,
              ),
            );
          }
          resolve({
            url:       result.url,
            secureUrl: result.secure_url,
            publicId:  result.public_id,
            width:     result.width,
            height:    result.height,
            format:    result.format,
            bytes:     result.bytes,
          });
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload multiple files in parallel.
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder = 'kosres/properties',
  ): Promise<CloudinaryUploadResult[]> {
    return Promise.all(files.map((f) => this.uploadFile(f.buffer, folder)));
  }

  /**
   * Delete an image from Cloudinary by its public_id.
   */
  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  /**
   * Generate a signed upload URL so the browser can upload directly
   * to Cloudinary without going through the server (optional, fast path).
   */
  generateSignedUploadParams(folder = 'kosres/properties') {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { folder, timestamp };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );
    return {
      timestamp,
      signature,
      folder,
      apiKey:    process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
  }
}
