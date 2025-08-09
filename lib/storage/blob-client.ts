import { put, del, list, head } from '@vercel/blob';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export class BlobStorageClient {
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default
  private static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/mov',
    'video/avi',
    'video/quicktime'
  ];
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  // Upload a video file
  static async uploadVideo(
    file: File, 
    userId: string, 
    videoId: string,
    options?: UploadOptions
  ): Promise<string> {
    await this.validateFile(file, {
      maxFileSize: options?.maxFileSize || this.MAX_FILE_SIZE,
      allowedTypes: options?.allowedTypes || this.ALLOWED_VIDEO_TYPES
    });

    const fileName = this.generateFileName(file, videoId);
    const filePath = `videos/${userId}/${fileName}`;

    try {
      const blob = await put(filePath, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      return blob.url;
    } catch (error) {
      console.error('Video upload failed:', error);
      throw new Error('Failed to upload video file');
    }
  }

  // Upload an image file
  static async uploadImage(
    file: File, 
    userId: string, 
    imageId: string,
    options?: UploadOptions
  ): Promise<string> {
    await this.validateFile(file, {
      maxFileSize: options?.maxFileSize || this.MAX_FILE_SIZE,
      allowedTypes: options?.allowedTypes || this.ALLOWED_IMAGE_TYPES
    });

    const fileName = this.generateFileName(file, imageId);
    const filePath = `images/${userId}/${fileName}`;

    try {
      const blob = await put(filePath, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      return blob.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image file');
    }
  }

  // Upload a thumbnail
  static async uploadThumbnail(
    thumbnailBlob: Blob, 
    userId: string, 
    videoId: string
  ): Promise<string> {
    const fileName = `thumb_${videoId}.jpg`;
    const filePath = `thumbnails/${userId}/${fileName}`;

    try {
      const blob = await put(filePath, thumbnailBlob, {
        access: 'public',
        addRandomSuffix: false,
      });

      return blob.url;
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
      throw new Error('Failed to upload thumbnail');
    }
  }

  // Upload an exported video
  static async uploadExport(
    exportBlob: Blob, 
    userId: string, 
    exportId: string,
    format: string
  ): Promise<string> {
    const fileName = `export_${exportId}.${format}`;
    const filePath = `exports/${userId}/${fileName}`;

    try {
      const blob = await put(filePath, exportBlob, {
        access: 'public',
        addRandomSuffix: false,
      });

      return blob.url;
    } catch (error) {
      console.error('Export upload failed:', error);
      throw new Error('Failed to upload export');
    }
  }

  // Delete a file
  static async deleteFile(url: string): Promise<boolean> {
    try {
      await del(url);
      return true;
    } catch (error) {
      console.error('File deletion failed:', error);
      return false;
    }
  }

  // List user files
  static async listUserFiles(userId: string, folder: 'videos' | 'images' | 'thumbnails' | 'exports' = 'videos') {
    try {
      const { blobs } = await list({
        prefix: `${folder}/${userId}/`,
        limit: 100,
      });
      return blobs;
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  // Get file metadata
  static async getFileInfo(url: string) {
    try {
      const info = await head(url);
      return {
        size: info.size,
        contentType: info.contentType,
        lastModified: info.uploadedAt,
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  // Generate thumbnail from video
  static async generateThumbnail(videoFile: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        // Set canvas dimensions
        canvas.width = Math.min(video.videoWidth, 640);
        canvas.height = Math.min(video.videoHeight, 360);
        
        // Seek to 1 second or 10% of video, whichever is smaller
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        try {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail blob'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => {
        reject(new Error('Failed to load video for thumbnail generation'));
      };

      // Load video
      video.src = URL.createObjectURL(videoFile);
    });
  }

  // Private utility methods
  private static async validateFile(file: File, options: {
    maxFileSize: number;
    allowedTypes: string[];
  }): Promise<void> {
    // Check file size
    if (file.size > options.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${Math.round(options.maxFileSize / 1024 / 1024)}MB`);
    }

    // Check file type
    if (!options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported. Allowed types: ${options.allowedTypes.join(', ')}`);
    }
  }

  private static generateFileName(file: File, id: string): string {
    const extension = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    return `${id}_${timestamp}.${extension}`;
  }

  // Utility function to get file size in human readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get storage usage for a user
  static async getUserStorageUsage(userId: string): Promise<{
    totalSize: number;
    fileCount: number;
    breakdown: {
      videos: { size: number; count: number };
      images: { size: number; count: number };
      thumbnails: { size: number; count: number };
      exports: { size: number; count: number };
    };
  }> {
    const folders = ['videos', 'images', 'thumbnails', 'exports'] as const;
    const breakdown = {
      videos: { size: 0, count: 0 },
      images: { size: 0, count: 0 },
      thumbnails: { size: 0, count: 0 },
      exports: { size: 0, count: 0 },
    };

    let totalSize = 0;
    let fileCount = 0;

    for (const folder of folders) {
      const files = await this.listUserFiles(userId, folder);
      
      for (const file of files) {
        breakdown[folder].size += file.size;
        breakdown[folder].count += 1;
        totalSize += file.size;
        fileCount += 1;
      }
    }

    return {
      totalSize,
      fileCount,
      breakdown,
    };
  }
}

export default BlobStorageClient;