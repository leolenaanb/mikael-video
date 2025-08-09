import { DatabaseClient } from '../db/client'
import type { User } from '@clerk/nextjs/server'

export interface SyncedUser {
  id: string
  clerkId: string
  email?: string
  fullName?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export class UserSyncService {
  /**
   * Sync a Clerk user to our database
   * This should be called whenever a user signs in or their profile is updated
   */
  static async syncUser(clerkUser: User): Promise<SyncedUser> {
    try {
      const userData = {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        fullName: clerkUser.fullName,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        avatarUrl: clerkUser.imageUrl,
      }

      const syncedUser = await DatabaseClient.createUser(userData)
      return this.formatUser(syncedUser)
    } catch (error) {
      console.error('Failed to sync user:', error)
      throw new Error('User sync failed')
    }
  }

  /**
   * Get user from database by Clerk ID
   */
  static async getUserByClerkId(clerkId: string): Promise<SyncedUser | null> {
    try {
      const user = await DatabaseClient.getUserByClerkId(clerkId)
      return user ? this.formatUser(user) : null
    } catch (error) {
      console.error('Failed to get user by Clerk ID:', error)
      return null
    }
  }

  /**
   * Ensure user exists in database, sync if not
   */
  static async ensureUserExists(clerkUser: User): Promise<SyncedUser> {
    try {
      // Try to get existing user first
      let user = await this.getUserByClerkId(clerkUser.id)
      
      if (!user) {
        // User doesn't exist, sync them
        user = await this.syncUser(clerkUser)
      } else {
        // User exists, but let's update their info in case it changed
        const updatedUser = await this.syncUser(clerkUser)
        user = updatedUser
      }

      return user
    } catch (error) {
      console.error('Failed to ensure user exists:', error)
      throw new Error('User validation failed')
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(clerkId: string) {
    try {
      const user = await this.getUserByClerkId(clerkId)
      if (!user) return null

      const stats = await DatabaseClient.getStats(user.id)
      return {
        user,
        stats: {
          totalVideos: parseInt(stats.total_videos) || 0,
          completedVideos: parseInt(stats.completed_videos) || 0,
          processingVideos: parseInt(stats.processing_videos) || 0,
          totalImages: parseInt(stats.total_images) || 0,
          totalStorageUsed: parseInt(stats.total_storage_used) || 0,
        }
      }
    } catch (error) {
      console.error('Failed to get user stats:', error)
      return null
    }
  }

  /**
   * Format database user record to our interface
   */
  private static formatUser(dbUser: any): SyncedUser {
    return {
      id: dbUser.id,
      clerkId: dbUser.clerk_id,
      email: dbUser.email,
      fullName: dbUser.full_name,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      avatarUrl: dbUser.avatar_url,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    }
  }
}

/**
 * Hook to get or create user in database
 * Use this in your components to ensure the user exists in the database
 */
export async function useUserSync(clerkUser: User | null | undefined) {
  if (!clerkUser) return null

  try {
    return await UserSyncService.ensureUserExists(clerkUser)
  } catch (error) {
    console.error('User sync hook failed:', error)
    return null
  }
}