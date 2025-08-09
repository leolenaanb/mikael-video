"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { UserSyncService } from "@/lib/auth/user-sync"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { videoStore } from "@/lib/video-store"
import {
  Zap,
  Upload,
  Plus,
  Play,
  Download,
  Calendar,
  Clock,
  User,
  LogOut,
  X,
  FileVideo,
  Sparkles,
  SeparatorVerticalIcon as Separator,
} from "lucide-react"

interface VideoFile {
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
}

export default function DashboardPage() {
  const [dragActive, setDragActive] = useState(false)
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [syncedUser, setSyncedUser] = useState<any>(null)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/")
    }
  }, [user, isLoaded, router])

  // Sync user with database and load videos
  useEffect(() => {
    const syncUserAndLoadVideos = async () => {
      if (!user) return

      try {
        // Sync user with database
        const syncedUserData = await UserSyncService.ensureUserExists(user)
        setSyncedUser(syncedUserData)

        // Load user's videos
        setIsLoadingVideos(true)
        const userVideos = await videoStore.getAllVideos(syncedUserData.id)
        setVideos(userVideos)
      } catch (error) {
        console.error('Failed to sync user or load videos:', error)
      } finally {
        setIsLoadingVideos(false)
      }
    }

    if (isLoaded && user) {
      syncUserAndLoadVideos()
    }
  }, [user, isLoaded])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    if (!syncedUser) {
      console.error('User not synced yet')
      return
    }

    for (const file of files) {
      if (file.type.startsWith("video/") || file.type.startsWith("image/")) {
        try {
          const title = file.name.replace(/\.[^/.]+$/, "")
          
          // Create video in database and upload to Vercel Blob
          const newVideo = await videoStore.createVideo(file, syncedUser.id, title)
          
          // Add to local state immediately
          setVideos((prev) => [newVideo, ...prev])

          // Start processing simulation
          simulateProcessing(newVideo.id)
        } catch (error) {
          console.error("Failed to upload file:", error)
          // You could show a toast notification here
        }
      }
    }
  }

  const simulateProcessing = async (videoId: string) => {
    let progress = 0
    const interval = setInterval(async () => {
      progress += Math.random() * 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        try {
          // Update to completed in database
          await videoStore.updateVideo(videoId, {
            status: "completed",
            progress: undefined,
          })

          // Update local state
          setVideos((prev) =>
            prev.map((video) =>
              video.id === videoId
                ? {
                    ...video,
                    status: "completed",
                    progress: undefined,
                  }
                : video,
            ),
          )
        } catch (error) {
          console.error('Failed to update video status:', error)
          // Update to failed status
          setVideos((prev) =>
            prev.map((video) =>
              video.id === videoId
                ? {
                    ...video,
                    status: "failed",
                    progress: undefined,
                  }
                : video,
            ),
          )
        }
      } else {
        // Update progress in database and local state
        try {
          await videoStore.updateVideo(videoId, { progress })
          setVideos((prev) => prev.map((video) => (video.id === videoId ? { ...video, progress } : video)))
        } catch (error) {
          console.error('Failed to update progress:', error)
        }
      }
    }, 300)
  }

  const deleteVideo = async (videoId: string) => {
    if (!syncedUser) return

    try {
      const success = await videoStore.deleteVideo(videoId, syncedUser.id)
      if (success) {
        setVideos((prev) => prev.filter((video) => video.id !== videoId))
      } else {
        console.error('Failed to delete video')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white"
      case "processing":
        return "bg-orange-500 text-black"
      case "uploading":
        return "bg-blue-600 text-white"
      case "failed":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-gray-300"
    }
  }

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen gradient-bg flex items-center justify-center">
            <Card className="bg-gray-900/80 border-gray-800 max-w-md">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Loading</h2>
                <p className="text-gray-400">Please wait while we load your dashboard...</p>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800 bg-black/50 backdrop-blur-sm px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-white">Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || user.firstName || "User"} 
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              {user?.fullName || user?.firstName || "User"}
            </div>
            <SignOutButton>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </SignOutButton>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2 text-white">Dashboard</h1>
            <p className="text-gray-400">Create and manage your viral video content with AI</p>
          </div>

          {/* Upload Section */}
          <Card className="bg-gray-900/50 border-gray-800 glow-orange">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Upload New Content
              </CardTitle>
              <CardDescription className="text-gray-400">
                Drag and drop your video or image file or click to browse (MP4, MOV, AVI, JPG, PNG up to 500MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-orange-500 bg-orange-500/10 glow-orange-strong"
                    : "border-gray-700 hover:border-orange-500 hover:bg-gray-800/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Drop your content here</h3>
                <p className="text-gray-400 mb-6">Supports MP4, MOV, AVI, JPG, PNG files up to 500MB</p>
                <Button className="gradient-primary hover:gradient-primary-hover text-black font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Videos */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Content ({videos.length})</CardTitle>
              <CardDescription className="text-gray-400">Your recently created and processed content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingVideos ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                      <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Loading your content</h3>
                    <p className="text-gray-400">Please wait while we fetch your videos...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileVideo className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No content yet</h3>
                    <p className="text-gray-400">
                      Upload your first video or image to get started with AI-powered editing!
                    </p>
                  </div>
                ) : (
                  videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-6 border border-gray-800 rounded-xl hover:bg-gray-800/30 hover:border-orange-500/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-20 h-14 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl || "/placeholder.svg"}
                              alt="Content thumbnail"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Play className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{video.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {video.createdAt}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {video.duration}
                            </span>
                          </div>
                          {video.progress !== undefined && (
                            <div className="mt-3">
                              <Progress value={video.progress} className="h-2" />
                              <p className="text-xs text-gray-400 mt-1">
                                {video.status === "uploading" ? "Uploading" : "Processing"}:{" "}
                                {Math.round(video.progress)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(video.status)}>{video.status}</Badge>

                        {video.status === "completed" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gradient-primary hover:gradient-primary-hover text-black font-semibold"
                              onClick={() => router.push(`/editor/${video.id}`)}
                            >
                              Edit with AI
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteVideo(video.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
