import { DatabaseClient } from './db/client'
import { BlobStorageClient } from './storage/blob-client'

export interface VideoData {
  id: string
  title: string
  status: "uploading" | "processing" | "completed" | "failed"
  createdAt: string
  duration: string
  progress?: number
  file?: File
  videoUrl?: string
  thumbnailUrl?: string
  isImage?: boolean
  userId?: string
  fileSize?: number
  fileType?: string
  description?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

class VideoStore {
  // Create a new video record and upload file
  async createVideo(
    file: File, 
    userId: string, 
    title: string,
    description?: string
  ): Promise<VideoData> {
    try {
      const isImage = file.type.startsWith('image/')
      
      // Create video record in database first
      const videoRecord = await DatabaseClient.createVideo({
        userId,
        title,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isImage,
        description
      })

      // Upload file to blob storage
      const fileUrl = isImage 
        ? await BlobStorageClient.uploadImage(file, userId, videoRecord.id)
        : await BlobStorageClient.uploadVideo(file, userId, videoRecord.id)

      // Update video record with file URL
      await DatabaseClient.updateVideo(videoRecord.id, {
        fileUrl,
        status: 'processing'
      })

      // Generate and upload thumbnail for videos
      if (!isImage) {
        try {
          const thumbnailBlob = await BlobStorageClient.generateThumbnail(file)
          const thumbnailUrl = await BlobStorageClient.uploadThumbnail(thumbnailBlob, userId, videoRecord.id)
          
          await DatabaseClient.updateVideo(videoRecord.id, {
            thumbnailUrl
          })
        } catch (thumbnailError) {
          console.warn('Thumbnail generation failed:', thumbnailError)
        }
      }

      // Return formatted video data
      return this.formatVideoData(videoRecord, file, fileUrl)
    } catch (error) {
      console.error('Video creation failed:', error)
      throw new Error('Failed to create video')
    }
  }

  // Get video by ID
  async getVideo(id: string): Promise<VideoData | null> {
    try {
      const videoRecord = await DatabaseClient.getVideo(id)
      if (!videoRecord) return null
      
      return this.formatVideoData(videoRecord)
    } catch (error) {
      console.error('Failed to get video:', error)
      return null
    }
  }

  // Update video
  async updateVideo(id: string, updates: Partial<VideoData>): Promise<VideoData | null> {
    try {
      const dbUpdates: any = {}
      
      if (updates.status) dbUpdates.status = updates.status
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress
      if (updates.videoUrl) dbUpdates.fileUrl = updates.videoUrl
      if (updates.thumbnailUrl) dbUpdates.thumbnailUrl = updates.thumbnailUrl
      if (updates.duration) {
        // Convert duration string to seconds
        const parts = updates.duration.split(':')
        const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
        dbUpdates.duration = seconds
      }

      const updatedRecord = await DatabaseClient.updateVideo(id, dbUpdates)
      if (!updatedRecord) return null

      return this.formatVideoData(updatedRecord)
    } catch (error) {
      console.error('Failed to update video:', error)
      return null
    }
  }

  // Get all videos for a user
  async getAllVideos(userId: string): Promise<VideoData[]> {
    try {
      const videoRecords = await DatabaseClient.getUserVideos(userId)
      return videoRecords.map(record => this.formatVideoData(record))
    } catch (error) {
      console.error('Failed to get all videos:', error)
      return []
    }
  }

  // Delete video
  async deleteVideo(id: string, userId: string): Promise<boolean> {
    try {
      // Get video record first
      const videoRecord = await DatabaseClient.getVideo(id)
      if (!videoRecord) return false

      // Delete files from blob storage
      const deletePromises = []
      if (videoRecord.file_url) {
        deletePromises.push(BlobStorageClient.deleteFile(videoRecord.file_url))
      }
      if (videoRecord.thumbnail_url) {
        deletePromises.push(BlobStorageClient.deleteFile(videoRecord.thumbnail_url))
      }

      // Wait for file deletions (don't fail if they error)
      await Promise.allSettled(deletePromises)

      // Delete from database
      const deletedRecord = await DatabaseClient.deleteVideo(id, userId)
      return !!deletedRecord
    } catch (error) {
      console.error('Failed to delete video:', error)
      return false
    }
  }

  // Legacy methods for backward compatibility
  createVideoUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  async createThumbnail(file: File): Promise<string> {
    try {
      const thumbnailBlob = await BlobStorageClient.generateThumbnail(file)
      return URL.createObjectURL(thumbnailBlob)
    } catch (error) {
      console.error('Thumbnail creation failed:', error)
      throw error
    }
  }

  // Get user storage statistics
  async getStorageStats(userId: string) {
    try {
      const [dbStats, storageUsage] = await Promise.all([
        DatabaseClient.getStats(userId),
        BlobStorageClient.getUserStorageUsage(userId)
      ])

      return {
        ...dbStats,
        ...storageUsage,
        formattedStorageUsed: BlobStorageClient.formatFileSize(storageUsage.totalSize)
      }
    } catch (error) {
      console.error('Failed to get storage stats:', error)
      return null
    }
  }

  // Format database record to VideoData interface
  private formatVideoData(record: any, file?: File, fileUrl?: string): VideoData {
    const duration = record.duration 
      ? `${Math.floor(record.duration / 60)}:${(record.duration % 60).toString().padStart(2, '0')}`
      : (record.is_image ? 'Image' : '0:00')

    return {
      id: record.id,
      title: record.title,
      status: record.status,
      createdAt: this.formatDate(record.created_at),
      duration,
      progress: record.progress,
      file,
      videoUrl: fileUrl || record.file_url,
      thumbnailUrl: record.thumbnail_url,
      isImage: record.is_image,
      userId: record.user_id,
      fileSize: record.file_size,
      fileType: record.file_type,
      description: record.description
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }
}

export const videoStore = new VideoStore()
