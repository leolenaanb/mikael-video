import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if tables exist
    const { rows } = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'videos', 'video_processing_jobs', 'video_exports');
    `;

    if (rows.length === 4) {
      return NextResponse.json({ 
        message: 'Database already initialized', 
        tables: rows.map(r => r.table_name) 
      });
    }

    // Initialize database with schema
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          clerk_id TEXT UNIQUE NOT NULL,
          email TEXT,
          full_name TEXT,
          first_name TEXT,
          last_name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create videos table
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          file_name TEXT NOT NULL,
          file_size BIGINT,
          file_type TEXT,
          duration INTEGER,
          width INTEGER,
          height INTEGER,
          status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
          progress INTEGER DEFAULT 0,
          file_url TEXT,
          thumbnail_url TEXT,
          is_image BOOLEAN DEFAULT FALSE,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create video processing jobs table
    await sql`
      CREATE TABLE IF NOT EXISTS video_processing_jobs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
          job_type TEXT NOT NULL DEFAULT 'thumbnail_generation',
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
          progress INTEGER DEFAULT 0,
          result_url TEXT,
          error_message TEXT,
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create video exports table
    await sql`
      CREATE TABLE IF NOT EXISTS video_exports (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          template_type TEXT NOT NULL,
          export_format TEXT NOT NULL,
          quality TEXT NOT NULL,
          settings JSONB DEFAULT '{}',
          export_url TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_video_id ON video_processing_jobs(video_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_status ON video_processing_jobs(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_video_exports_user_id ON video_exports(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_video_exports_video_id ON video_exports(video_id);`;

    // Create updated_at trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // Apply updated_at triggers
    await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users;`;
    await sql`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`;
    
    await sql`DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;`;
    await sql`CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`;
    
    await sql`DROP TRIGGER IF EXISTS update_video_exports_updated_at ON video_exports;`;
    await sql`CREATE TRIGGER update_video_exports_updated_at BEFORE UPDATE ON video_exports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`;

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      tables: ['users', 'videos', 'video_processing_jobs', 'video_exports']
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}