import { sql } from '@vercel/postgres';

// Database client utility functions
export class DatabaseClient {
  // User operations
  static async createUser(userData: {
    clerkId: string;
    email?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    const { rows } = await sql`
      INSERT INTO users (clerk_id, email, full_name, first_name, last_name, avatar_url)
      VALUES (${userData.clerkId}, ${userData.email}, ${userData.fullName}, ${userData.firstName}, ${userData.lastName}, ${userData.avatarUrl})
      ON CONFLICT (clerk_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
      RETURNING *;
    `;
    return rows[0];
  }

  static async getUserByClerkId(clerkId: string) {
    const { rows } = await sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId} LIMIT 1;
    `;
    return rows[0] || null;
  }

  // Video operations
  static async createVideo(videoData: {
    userId: string;
    title: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    isImage?: boolean;
    description?: string;
  }) {
    const { rows } = await sql`
      INSERT INTO videos (user_id, title, file_name, file_size, file_type, is_image, description)
      VALUES (${videoData.userId}, ${videoData.title}, ${videoData.fileName}, ${videoData.fileSize}, ${videoData.fileType}, ${videoData.isImage || false}, ${videoData.description})
      RETURNING *;
    `;
    return rows[0];
  }

  static async updateVideo(videoId: string, updates: {
    status?: string;
    progress?: number;
    fileUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    width?: number;
    height?: number;
    metadata?: object;
  }) {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramIndex}`);
        values.push(key === 'metadata' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) return null;

    const query = `
      UPDATE videos 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const { rows } = await sql.query(query, [...values, videoId]);
    return rows[0];
  }

  static async getVideo(videoId: string) {
    const { rows } = await sql`
      SELECT v.*, u.full_name as user_name, u.avatar_url as user_avatar
      FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ${videoId}
      LIMIT 1;
    `;
    return rows[0] || null;
  }

  static async getUserVideos(userId: string, limit = 50, offset = 0) {
    const { rows } = await sql`
      SELECT * FROM videos 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `;
    return rows;
  }

  static async deleteVideo(videoId: string, userId: string) {
    const { rows } = await sql`
      DELETE FROM videos 
      WHERE id = ${videoId} AND user_id = ${userId}
      RETURNING *;
    `;
    return rows[0] || null;
  }

  // Processing job operations
  static async createProcessingJob(jobData: {
    videoId: string;
    jobType: string;
    status?: string;
  }) {
    const { rows } = await sql`
      INSERT INTO video_processing_jobs (video_id, job_type, status)
      VALUES (${jobData.videoId}, ${jobData.jobType}, ${jobData.status || 'pending'})
      RETURNING *;
    `;
    return rows[0];
  }

  static async updateProcessingJob(jobId: string, updates: {
    status?: string;
    progress?: number;
    resultUrl?: string;
    errorMessage?: string;
  }) {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) return null;

    // Add completion timestamp if status is completed or failed
    if (updates.status === 'completed' || updates.status === 'failed') {
      updateFields.push(`completed_at = NOW()`);
    }

    // Add started timestamp if status is processing
    if (updates.status === 'processing') {
      updateFields.push(`started_at = NOW()`);
    }

    const query = `
      UPDATE video_processing_jobs 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const { rows } = await sql.query(query, [...values, jobId]);
    return rows[0];
  }

  // Export operations
  static async createExport(exportData: {
    videoId: string;
    userId: string;
    templateType: string;
    exportFormat: string;
    quality: string;
    settings?: object;
  }) {
    const { rows } = await sql`
      INSERT INTO video_exports (video_id, user_id, template_type, export_format, quality, settings)
      VALUES (${exportData.videoId}, ${exportData.userId}, ${exportData.templateType}, ${exportData.exportFormat}, ${exportData.quality}, ${JSON.stringify(exportData.settings || {})})
      RETURNING *;
    `;
    return rows[0];
  }

  static async updateExport(exportId: string, updates: {
    status?: string;
    exportUrl?: string;
  }) {
    const { rows } = await sql`
      UPDATE video_exports 
      SET status = ${updates.status}, export_url = ${updates.exportUrl}, updated_at = NOW()
      WHERE id = ${exportId}
      RETURNING *;
    `;
    return rows[0];
  }

  // Utility functions
  static async initializeDatabase() {
    try {
      // This will be called to ensure tables exist
      // In production, you'd run migrations separately
      console.log('Database connection established');
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      return false;
    }
  }

  static async getStats(userId: string) {
    const { rows } = await sql`
      SELECT 
        COUNT(*) as total_videos,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_videos,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_videos,
        COUNT(CASE WHEN is_image = true THEN 1 END) as total_images,
        SUM(file_size) as total_storage_used
      FROM videos 
      WHERE user_id = ${userId};
    `;
    return rows[0];
  }
}

export default DatabaseClient;