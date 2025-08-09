"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { UserSyncService } from "@/lib/auth/user-sync"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { videoStore } from "@/lib/video-store"
import {
  Zap,
  Play,
  Pause,
  Download,
  Upload,
  Save,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  Sparkles,
  MoreHorizontal,
  SeparatorVerticalIcon as Separator,
} from "lucide-react"

interface Template {
  id: string
  name: string
  style: {
    backgroundColor: string
    textColor: string
    fontSize: string
    fontWeight: string
    layout: string
    aspectRatio: string
  }
}

export default function EditorPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [username, setUsername] = useState("@johndoe")
  const [displayName, setDisplayName] = useState("John Doe")
  const [caption, setCaption] = useState("This is an amazing viral moment! 🔥")
  const [overlayText, setOverlayText] = useState("Amazing content you need to see! 😱✨")
  const [partNumber, setPartNumber] = useState("Part 1")
  const [logoPosition, setLogoPosition] = useState({ x: 20, y: 20 })
  const [selectedTemplate, setSelectedTemplate] = useState("social")
  const [exportQuality, setExportQuality] = useState("1080p")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [videoData, setVideoData] = useState<any>(null)
  const [videoError, setVideoError] = useState<string>("")
  const [exportSuccess, setExportSuccess] = useState(false)
  const [isImage, setIsImage] = useState(false)
  const [imageDuration, setImageDuration] = useState(5)
  const [exportFormat, setExportFormat] = useState<"image" | "video">("image")
  const [watermark, setWatermark] = useState("@mikael_ai")
  const [syncedUser, setSyncedUser] = useState<any>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Redirect to sign-in if not authenticated and sync user
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/")
      return
    }

    if (user) {
      // Sync user with database
      UserSyncService.ensureUserExists(user)
        .then(setSyncedUser)
        .catch(console.error)
    }
  }, [user, isLoaded, router])

  const templates: Template[] = [
    {
      id: "social",
      name: "Social Post",
      style: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        fontSize: "16px",
        fontWeight: "400",
        layout: "social",
        aspectRatio: "5/6", // Instagram/Twitter post ratio
      },
    },
    {
      id: "viral",
      name: "Viral",
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        textColor: "#ffffff",
        fontSize: "20px",
        fontWeight: "bold",
        layout: "viral",
        aspectRatio: "9/16", // TikTok/Reels ratio
      },
    },
    {
      id: "podcast",
      name: "Podcast",
      style: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        textColor: "#f3f4f6",
        fontSize: "18px",
        fontWeight: "500",
        layout: "podcast",
        aspectRatio: "1/1", // Square format for podcast clips
      },
    },
    {
      id: "travel",
      name: "Travel",
      style: {
        backgroundColor: "rgba(249, 115, 22, 0.8)",
        textColor: "#fff7ed",
        fontSize: "18px",
        fontWeight: "600",
        layout: "travel",
        aspectRatio: "4/5", // Travel content ratio
      },
    },
  ]

  const currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0]

  // ... (keeping all the existing useEffect and handler functions the same)

  useEffect(() => {
    // Load video data from store
    const loadVideoData = async () => {
      try {
        const media = await videoStore.getVideo(params.id)
        if (media) {
          setVideoData(media)
          setIsImage(media.isImage || false)
          if (media.status !== "completed") {
            setVideoError("Media is still processing. Please wait for it to complete.")
          }
        } else {
          setVideoError("Media not found. Please go back to dashboard.")
        }
      } catch (error) {
        console.error('Failed to load video data:', error)
        setVideoError("Failed to load media. Please try again.")
      }
    }

    if (params.id) {
      loadVideoData()
    }
  }, [params.id])

  useEffect(() => {
    if (isImage) {
      setDuration(imageDuration)
      // Ensure image loads properly
      if (imageRef.current && videoData?.videoUrl) {
        imageRef.current.onload = () => {
          console.log("Image loaded successfully")
        }
        imageRef.current.onerror = () => {
          setVideoError("Failed to load image. Please check the image file.")
        }
      }
      return
    }

    const video = videoRef.current
    if (!video || !videoData?.videoUrl) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration || 0)
    const handleLoadError = () => setVideoError("Failed to load video. Please check the video file.")
    const handleCanPlay = () => {
      console.log("Video can play")
    }

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("error", handleLoadError)
    video.addEventListener("canplay", handleCanPlay)

    // Force load the video
    video.load()

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("error", handleLoadError)
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [videoData, isImage, imageDuration])

  const togglePlay = () => {
    if (isImage) return

    const video = videoRef.current
    if (!video) {
      console.error("Video element not found")
      return
    }

    if (!videoData?.videoUrl) {
      console.error("No video URL available")
      setVideoError("No video source available")
      return
    }

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((error) => {
        console.error("Failed to play video:", error)
        setVideoError("Failed to play video. Please check the video file.")
      })
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (isImage) return

    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const handleTimelineChange = (value: number[]) => {
    if (isImage) return

    const video = videoRef.current
    if (!video || duration === 0) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const url = URL.createObjectURL(file)
      setLogoUrl(url)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
  }

  // ... (keeping all existing export and processing functions)

  const createVideoWithOverlays = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current
      if (!canvas) {
        reject(new Error("Canvas not available"))
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas context not available"))
        return
      }

      // Set canvas dimensions for social media format
      const targetWidth = exportQuality === "1080p" ? 1080 : 720
      const targetHeight =
        currentTemplate.style.layout === "social" ? Math.round(targetWidth * 1.2) : Math.round((targetWidth * 16) / 9)

      canvas.width = targetWidth
      canvas.height = targetHeight

      const chunks: Blob[] = []
      let mediaRecorder: MediaRecorder

      try {
        const stream = canvas.captureStream(30)

        const options = [
          { mimeType: "video/webm;codecs=vp9" },
          { mimeType: "video/webm;codecs=vp8" },
          { mimeType: "video/webm" },
        ]

        let selectedOption = options[0]
        for (const option of options) {
          if (MediaRecorder.isTypeSupported(option.mimeType)) {
            selectedOption = option
            break
          }
        }

        mediaRecorder = new MediaRecorder(stream, selectedOption)
      } catch (error) {
        reject(new Error("MediaRecorder not supported"))
        return
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        resolve(blob)
      }

      mediaRecorder.onerror = (event) => {
        reject(new Error("Recording failed"))
      }

      let frameCount = 0
      const totalFrames = Math.ceil((isImage ? imageDuration : duration) * 30)
      let startTime = Date.now()

      const drawFrame = () => {
        const elapsed = (Date.now() - startTime) / 1000

        if (elapsed >= (isImage ? imageDuration : duration)) {
          mediaRecorder.stop()
          return
        }

        frameCount++
        const progress = Math.min((frameCount / totalFrames) * 100, 95)
        setExportProgress(progress)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (currentTemplate.style.layout === "social") {
          drawSocialLayout(ctx, canvas.width, canvas.height)
        } else if (currentTemplate.style.layout === "viral") {
          drawViralLayout(ctx, canvas.width, canvas.height)
        } else if (currentTemplate.style.layout === "podcast") {
          drawPodcastLayout(ctx, canvas.width, canvas.height)
        } else if (currentTemplate.style.layout === "travel") {
          drawTravelLayout(ctx, canvas.width, canvas.height)
        } else {
          drawOverlayLayout(ctx, canvas.width, canvas.height)
        }

        requestAnimationFrame(drawFrame)
      }

      mediaRecorder.start()

      if (isImage) {
        startTime = Date.now()
        drawFrame()
      } else {
        const video = videoRef.current
        if (video) {
          video.currentTime = 0
          video.onplay = () => {
            startTime = Date.now()
            drawFrame()
          }
          video.onseeked = () => {
            if (video.currentTime === 0) {
              video.play().catch(reject)
            }
          }
          video.currentTime = 0
        }
      }
    })
  }

  const exportAsImage = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current
      if (!canvas) {
        reject(new Error("Canvas not available"))
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas context not available"))
        return
      }

      // Set canvas dimensions for social media format
      const targetWidth = exportQuality === "1080p" ? 1080 : 720
      const targetHeight =
        currentTemplate.style.layout === "social" ? Math.round(targetWidth * 1.2) : Math.round((targetWidth * 16) / 9)

      canvas.width = targetWidth
      canvas.height = targetHeight

      setExportProgress(25)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (currentTemplate.style.layout === "social") {
        drawSocialLayout(ctx, canvas.width, canvas.height)
      } else {
        drawOverlayLayout(ctx, canvas.width, canvas.height)
      }

      setExportProgress(75)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setExportProgress(100)

            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${username.replace("@", "")}_social_post_${exportQuality}.png`
            link.style.display = "none"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            setTimeout(() => {
              URL.revokeObjectURL(url)
            }, 1000)

            resolve()
          } else {
            reject(new Error("Failed to create image blob"))
          }
        },
        "image/png",
        0.95,
      )
    })
  }

  const drawSocialLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const scale = width / 400

    // Clean white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Header section
    const headerHeight = 80 * scale
    const padding = 20 * scale
    const avatarSize = 48 * scale

    // Profile avatar
    if (logoUrl) {
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(logoImg, padding, padding, avatarSize, avatarSize)
        ctx.restore()
      }
      logoImg.src = logoUrl
    } else {
      // Default avatar
      ctx.fillStyle = "#1DA1F2"
      ctx.beginPath()
      ctx.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(displayName.charAt(0).toUpperCase(), padding + avatarSize / 2, padding + avatarSize / 2 + 6 * scale)
    }

    // Username and handle
    ctx.fillStyle = "#000000"
    ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"
    ctx.fillText(displayName, padding + avatarSize + 12 * scale, padding + 20 * scale)

    // Verification checkmark
    const checkX = padding + avatarSize + 12 * scale + ctx.measureText(displayName).width + 8 * scale
    ctx.fillStyle = "#1DA1F2"
    ctx.beginPath()
    ctx.arc(checkX, padding + 16 * scale, 8 * scale, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2 * scale
    ctx.beginPath()
    ctx.moveTo(checkX - 3 * scale, padding + 16 * scale)
    ctx.lineTo(checkX - 1 * scale, padding + 18 * scale)
    ctx.lineTo(checkX + 3 * scale, padding + 14 * scale)
    ctx.stroke()

    // Handle
    ctx.fillStyle = "#657786"
    ctx.font = `${14 * scale}px Inter, Arial, sans-serif`
    ctx.fillText(username, padding + avatarSize + 12 * scale, padding + 40 * scale)

    // Three dots menu
    ctx.fillStyle = "#657786"
    const dotsX = width - padding - 20 * scale
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(dotsX + i * 6 * scale, padding + 20 * scale, 2 * scale, 0, Math.PI * 2)
      ctx.fill()
    }

    // Caption text
    const textY = headerHeight + padding
    ctx.fillStyle = "#000000"
    ctx.font = `${15 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"

    // Word wrap caption
    const words = caption.split(" ")
    const lines = []
    let currentLine = ""
    const maxWidth = width - 2 * padding

    for (const word of words) {
      const testLine = currentLine + word + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine.trim())
        currentLine = word + " "
      } else {
        currentLine = testLine
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, padding, textY + index * 22 * scale)
    })

    // Media section with side margins (framed effect)
    const mediaY = textY + lines.length * 22 * scale + 20 * scale
    const mediaMargin = 30 * scale // Side margins for framing effect
    const mediaWidth = width - 2 * mediaMargin
    const mediaHeight = height - mediaY - 40 * scale

    // Draw media with framing
    if (isImage && imageRef.current) {
      ctx.drawImage(imageRef.current, mediaMargin, mediaY, mediaWidth, mediaHeight)
    } else if (!isImage && videoRef.current) {
      ctx.drawImage(videoRef.current, mediaMargin, mediaY, mediaWidth, mediaHeight)
    }

    // Overlay text (speech bubble style like in the image)
    if (overlayText) {
      const overlayY = mediaY + mediaHeight * 0.3
      const bubbleWidth = mediaWidth * 0.8
      const bubbleHeight = 50 * scale
      const bubbleX = mediaMargin + (mediaWidth - bubbleWidth) / 2

      // White speech bubble background
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.beginPath()
      ctx.roundRect(bubbleX, overlayY - bubbleHeight / 2, bubbleWidth, bubbleHeight, 25 * scale)
      ctx.fill()

      // Add small triangle for speech bubble
      ctx.beginPath()
      ctx.moveTo(bubbleX + bubbleWidth / 2 - 10 * scale, overlayY + bubbleHeight / 2)
      ctx.lineTo(bubbleX + bubbleWidth / 2, overlayY + bubbleHeight / 2 + 10 * scale)
      ctx.lineTo(bubbleX + bubbleWidth / 2 + 10 * scale, overlayY + bubbleHeight / 2)
      ctx.fill()

      // Overlay text
      ctx.fillStyle = "#000000"
      ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(overlayText, width / 2, overlayY + 6 * scale)
    }

    // Part number with lightning bolts
    if (partNumber) {
      const partY = mediaY + mediaHeight * 0.6
      const partWidth = 120 * scale
      const partHeight = 30 * scale
      const partX = mediaMargin + 20 * scale

      // Yellow/orange gradient background
      const gradient = ctx.createLinearGradient(
        partX,
        partY - partHeight / 2,
        partX + partWidth,
        partY + partHeight / 2,
      )
      gradient.addColorStop(0, "#fbbf24")
      gradient.addColorStop(1, "#f59e0b")
      ctx.fillStyle = gradient
      ctx.fillRect(partX, partY - partHeight / 2, partWidth, partHeight)

      // Part text with lightning bolts
      ctx.fillStyle = "#000000"
      ctx.font = `bold ${14 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "left"
      ctx.fillText(`⚡${partNumber}⚡`, partX + 10 * scale, partY + 4 * scale)
    }

    // Watermark at bottom right of media
    if (watermark) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = `${12 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "right"
      ctx.fillText(watermark, mediaMargin + mediaWidth - 10 * scale, mediaY + mediaHeight - 10 * scale)
    }
  }

  const drawViralLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const scale = width / 400

    // Clean white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Header section
    const headerHeight = 80 * scale
    const padding = 20 * scale
    const avatarSize = 48 * scale

    // Profile avatar
    if (logoUrl) {
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(logoImg, padding, padding, avatarSize, avatarSize)
        ctx.restore()
      }
      logoImg.src = logoUrl
    } else {
      // Default avatar
      ctx.fillStyle = "#1DA1F2"
      ctx.beginPath()
      ctx.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(displayName.charAt(0).toUpperCase(), padding + avatarSize / 2, padding + avatarSize / 2 + 6 * scale)
    }

    // Username and handle
    ctx.fillStyle = "#000000"
    ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"
    ctx.fillText(displayName, padding + avatarSize + 12 * scale, padding + 20 * scale)

    // Verification checkmark
    const checkX = padding + avatarSize + 12 * scale + ctx.measureText(displayName).width + 8 * scale
    ctx.fillStyle = "#1DA1F2"
    ctx.beginPath()
    ctx.arc(checkX, padding + 16 * scale, 8 * scale, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2 * scale
    ctx.beginPath()
    ctx.moveTo(checkX - 3 * scale, padding + 16 * scale)
    ctx.lineTo(checkX - 1 * scale, padding + 18 * scale)
    ctx.lineTo(checkX + 3 * scale, padding + 14 * scale)
    ctx.stroke()

    // Handle
    ctx.fillStyle = "#657786"
    ctx.font = `${14 * scale}px Inter, Arial, sans-serif`
    ctx.fillText(username, padding + avatarSize + 12 * scale, padding + 40 * scale)

    // Three dots menu
    ctx.fillStyle = "#657786"
    const dotsX = width - padding - 20 * scale
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(dotsX + i * 6 * scale, padding + 20 * scale, 2 * scale, 0, Math.PI * 2)
      ctx.fill()
    }

    // Caption text
    const textY = headerHeight + padding
    ctx.fillStyle = "#000000"
    ctx.font = `${15 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"

    // Word wrap caption
    const words = caption.split(" ")
    const lines = []
    let currentLine = ""
    const maxWidth = width - 2 * padding

    for (const word of words) {
      const testLine = currentLine + word + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine.trim())
        currentLine = word + " "
      } else {
        currentLine = testLine
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, padding, textY + index * 22 * scale)
    })

    // Media section with side margins (framed effect)
    const mediaY = textY + lines.length * 22 * scale + 20 * scale
    const mediaMargin = 30 * scale // Side margins for framing effect
    const mediaWidth = width - 2 * mediaMargin
    const mediaHeight = height - mediaY - 40 * scale

    // Draw media with framing
    if (isImage && imageRef.current) {
      ctx.drawImage(imageRef.current, mediaMargin, mediaY, mediaWidth, mediaHeight)
    } else if (!isImage && videoRef.current) {
      ctx.drawImage(videoRef.current, mediaMargin, mediaY, mediaWidth, mediaHeight)
    }

    // Overlay text (speech bubble style like in the image)
    if (overlayText) {
      const overlayY = mediaY + mediaHeight * 0.3
      const bubbleWidth = mediaWidth * 0.8
      const bubbleHeight = 50 * scale
      const bubbleX = mediaMargin + (mediaWidth - bubbleWidth) / 2

      // White speech bubble background
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.beginPath()
      ctx.roundRect(bubbleX, overlayY - bubbleHeight / 2, bubbleWidth, bubbleHeight, 25 * scale)
      ctx.fill()

      // Add small triangle for speech bubble
      ctx.beginPath()
      ctx.moveTo(bubbleX + bubbleWidth / 2 - 10 * scale, overlayY + bubbleHeight / 2)
      ctx.lineTo(bubbleX + bubbleWidth / 2, overlayY + bubbleHeight / 2 + 10 * scale)
      ctx.lineTo(bubbleX + bubbleWidth / 2 + 10 * scale, overlayY + bubbleHeight / 2)
      ctx.fill()

      // Overlay text
      ctx.fillStyle = "#000000"
      ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(overlayText, width / 2, overlayY + 6 * scale)
    }

    // Part number with lightning bolts
    if (partNumber) {
      const partY = mediaY + mediaHeight * 0.6
      const partWidth = 120 * scale
      const partHeight = 30 * scale
      const partX = mediaMargin + 20 * scale

      // Yellow/orange gradient background
      const gradient = ctx.createLinearGradient(
        partX,
        partY - partHeight / 2,
        partX + partWidth,
        partY + partHeight / 2,
      )
      gradient.addColorStop(0, "#fbbf24")
      gradient.addColorStop(1, "#f59e0b")
      ctx.fillStyle = gradient
      ctx.fillRect(partX, partY - partHeight / 2, partWidth, partHeight)

      // Part text with lightning bolts
      ctx.fillStyle = "#000000"
      ctx.font = `bold ${14 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "left"
      ctx.fillText(`⚡${partNumber}⚡`, partX + 10 * scale, partY + 4 * scale)
    }

    // Watermark at bottom right of media
    if (watermark) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = `${12 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "right"
      ctx.fillText(watermark, mediaMargin + mediaWidth - 10 * scale, mediaY + mediaHeight - 10 * scale)
    }
  }

  const drawPodcastLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const scale = width / 400

    // Clean white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Header section
    const headerHeight = 80 * scale
    const padding = 20 * scale
    const avatarSize = 48 * scale

    // Profile avatar
    if (logoUrl) {
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(logoImg, padding, padding, avatarSize, avatarSize)
        ctx.restore()
      }
      logoImg.src = logoUrl
    } else {
      // Default avatar
      ctx.fillStyle = "#1DA1F2"
      ctx.beginPath()
      ctx.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(displayName.charAt(0).toUpperCase(), padding + avatarSize / 2, padding + avatarSize / 2 + 6 * scale)
    }

    // Username and handle
    ctx.fillStyle = "#000000"
    ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"
    ctx.fillText(displayName, padding + avatarSize + 12 * scale, padding + 20 * scale)

    // Verification checkmark
    const checkX = padding + avatarSize + 12 * scale + ctx.measureText(displayName).width + 8 * scale
    ctx.fillStyle = "#1DA1F2"
    ctx.beginPath()
    ctx.arc(checkX, padding + 16 * scale, 8 * scale, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2 * scale
    ctx.beginPath()
    ctx.moveTo(checkX - 3 * scale, padding + 16 * scale)
    ctx.lineTo(checkX - 1 * scale, padding + 18 * scale)
    ctx.lineTo(checkX + 3 * scale, padding + 14 * scale)
    ctx.stroke()

    // Handle
    ctx.fillStyle = "#657786"
    ctx.font = `${14 * scale}px Inter, Arial, sans-serif`
    ctx.fillText(username, padding + avatarSize + 12 * scale, padding + 40 * scale)

    // Three dots menu
    ctx.fillStyle = "#657786"
    const dotsX = width - padding - 20 * scale
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(dotsX + i * 6 * scale, padding + 20 * scale, 2 * scale, 0, Math.PI * 2)
      ctx.fill()
    }

    // Caption text
    const textY = headerHeight + padding
    ctx.fillStyle = "#000000"
    ctx.font = `${15 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"

    // Word wrap caption
    const words = caption.split(" ")
    const lines = []
    let currentLine = ""
    const maxWidth = width - 2 * padding

    for (const word of words) {
      const testLine = currentLine + word + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine.trim())
        currentLine = word + " "
      } else {
        currentLine = testLine
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, padding, textY + index * 22 * scale)
    })

    // Media section with side margins (framed effect)
    const mediaY = textY + lines.length * 22 * scale + 20 * scale
    const mediaMargin = 30 * scale // Side margins for framing effect
    const mediaWidth = width - 2 * mediaMargin
    const mediaHeight = height - mediaY - 40 * scale

    // Draw media with framing
    if (isImage && imageRef.current) {
      ctx.drawImage(imageRef.current, mediaMargin, mediaY, mediaWidth, mediaHeight)
    } else if (!isImage && videoRef.current) {
      ctx.drawImage(videoRef.current, mediaMargin, mediaY, mediaWidth, mediaHeight)
    }

    // Overlay text (speech bubble style like in the image)
    if (overlayText) {
      const overlayY = mediaY + mediaHeight * 0.3
      const bubbleWidth = mediaWidth * 0.8
      const bubbleHeight = 50 * scale
      const bubbleX = mediaMargin + (mediaWidth - bubbleWidth) / 2

      // White speech bubble background
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.beginPath()
      ctx.roundRect(bubbleX, overlayY - bubbleHeight / 2, bubbleWidth, bubbleHeight, 25 * scale)
      ctx.fill()

      // Add small triangle for speech bubble
      ctx.beginPath()
      ctx.moveTo(bubbleX + bubbleWidth / 2 - 10 * scale, overlayY + bubbleHeight / 2)
      ctx.lineTo(bubbleX + bubbleWidth / 2, overlayY + bubbleHeight / 2 + 10 * scale)
      ctx.lineTo(bubbleX + bubbleWidth / 2 + 10 * scale, overlayY + bubbleHeight / 2)
      ctx.fill()

      // Overlay text
      ctx.fillStyle = "#000000"
      ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(overlayText, width / 2, overlayY + 6 * scale)
    }

    // Part number with lightning bolts
    if (partNumber) {
      const partY = mediaY + mediaHeight * 0.6
      const partWidth = 120 * scale
      const partHeight = 30 * scale
      const partX = mediaMargin + 20 * scale

      // Yellow/orange gradient background
      const gradient = ctx.createLinearGradient(
        partX,
        partY - partHeight / 2,
        partX + partWidth,
        partY + partHeight / 2,
      )
      gradient.addColorStop(0, "#fbbf24")
      gradient.addColorStop(1, "#f59e0b")
      ctx.fillStyle = gradient
      ctx.fillRect(partX, partY - partHeight / 2, partWidth, partHeight)

      // Part text with lightning bolts
      ctx.fillStyle = "#000000"
      ctx.font = `bold ${14 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "left"
      ctx.fillText(`⚡${partNumber}⚡`, partX + 10 * scale, partY + 4 * scale)
    }

    // Watermark at bottom right of media
    if (watermark) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = `${12 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "right"
      ctx.fillText(watermark, mediaMargin + mediaWidth - 10 * scale, mediaY + mediaHeight - 10 * scale)
    }
  }

  const drawTravelLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const scale = width / 400

    // Clean white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Header section with travel theme
    const headerHeight = 80 * scale
    const padding = 20 * scale
    const avatarSize = 48 * scale

    // Profile avatar
    if (logoUrl) {
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(logoImg, padding, padding, avatarSize, avatarSize)
        ctx.restore()
      }
      logoImg.src = logoUrl
    } else {
      // Travel-themed avatar with location pin
      ctx.fillStyle = "#f97316" // Orange for travel theme
      ctx.beginPath()
      ctx.arc(padding + avatarSize / 2, padding + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText("📍", padding + avatarSize / 2, padding + avatarSize / 2 + 6 * scale)
    }

    // Username and handle with travel badge
    ctx.fillStyle = "#000000"
    ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"
    ctx.fillText(displayName, padding + avatarSize + 12 * scale, padding + 20 * scale)

    // Travel verification badge (different from others)
    const checkX = padding + avatarSize + 12 * scale + ctx.measureText(displayName).width + 8 * scale
    ctx.fillStyle = "#f97316" // Orange for travel
    ctx.beginPath()
    ctx.arc(checkX, padding + 16 * scale, 8 * scale, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${10 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "center"
    ctx.fillText("✈", checkX, padding + 18 * scale)

    // Handle
    ctx.fillStyle = "#657786"
    ctx.font = `${14 * scale}px Inter, Arial, sans-serif`
    ctx.fillText(username, padding + avatarSize + 12 * scale, padding + 40 * scale)

    // Three dots menu
    ctx.fillStyle = "#657786"
    const dotsX = width - padding - 20 * scale
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(dotsX + i * 6 * scale, padding + 20 * scale, 2 * scale, 0, Math.PI * 2)
      ctx.fill()
    }

    // Caption text
    const textY = headerHeight + padding
    ctx.fillStyle = "#000000"
    ctx.font = `${15 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"

    // Word wrap caption
    const words = caption.split(" ")
    const lines = []
    let currentLine = ""
    const maxWidth = width - 2 * padding

    for (const word of words) {
      const testLine = currentLine + word + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine.trim())
        currentLine = word + " "
      } else {
        currentLine = testLine
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, padding, textY + index * 22 * scale)
    })

    // Media section with side margins (framed effect)
    const mediaY = textY + lines.length * 22 * scale + 20 * scale
    const mediaMargin = 30 * scale // Side margins for framing effect
    const mediaWidth = width - 2 * mediaMargin
    const mediaHeight = height - mediaY - 40 * scale

    // Draw media with framing
    if (isImage && imageRef.current) {
      ctx.drawImage(imageRef.current, mediaMargin, mediaY, mediaWidth, mediaHeight)
    } else if (!isImage && videoRef.current) {
      ctx.drawImage(videoRef.current, mediaMargin, mediaY, mediaWidth, mediaHeight)
    }

    // Travel-specific overlay text (location style)
    if (overlayText) {
      const overlayY = mediaY + mediaHeight * 0.3
      const bubbleWidth = mediaWidth * 0.8
      const bubbleHeight = 50 * scale
      const bubbleX = mediaMargin + (mediaWidth - bubbleWidth) / 2

      // Orange travel-themed speech bubble background
      ctx.fillStyle = "rgba(249, 115, 22, 0.95)"
      ctx.beginPath()
      ctx.roundRect(bubbleX, overlayY - bubbleHeight / 2, bubbleWidth, bubbleHeight, 25 * scale)
      ctx.fill()

      // Add small triangle for speech bubble
      ctx.beginPath()
      ctx.moveTo(bubbleX + bubbleWidth / 2 - 10 * scale, overlayY + bubbleHeight / 2)
      ctx.lineTo(bubbleX + bubbleWidth / 2, overlayY + bubbleHeight / 2 + 10 * scale)
      ctx.lineTo(bubbleX + bubbleWidth / 2 + 10 * scale, overlayY + bubbleHeight / 2)
      ctx.fill()

      // Overlay text in white for travel theme
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${16 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(overlayText, width / 2, overlayY + 6 * scale)
    }

    // Part number with travel icons
    if (partNumber) {
      const partY = mediaY + mediaHeight * 0.6
      const partWidth = 120 * scale
      const partHeight = 30 * scale
      const partX = mediaMargin + 20 * scale

      // Orange travel gradient background
      const gradient = ctx.createLinearGradient(
        partX,
        partY - partHeight / 2,
        partX + partWidth,
        partY + partHeight / 2,
      )
      gradient.addColorStop(0, "#f97316")
      gradient.addColorStop(1, "#ea580c")
      ctx.fillStyle = gradient
      ctx.fillRect(partX, partY - partHeight / 2, partWidth, partHeight)

      // Part text with travel icons
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${14 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "left"
      ctx.fillText(`✈️${partNumber}🌍`, partX + 10 * scale, partY + 4 * scale)
    }

    // Watermark at bottom right of media
    if (watermark) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = `${12 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "right"
      ctx.fillText(watermark, mediaMargin + mediaWidth - 10 * scale, mediaY + mediaHeight - 10 * scale)
    }
  }

  const drawOverlayLayout = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const scale = width / 450

    // Draw media frame
    if (isImage && imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, width, height)
    } else if (!isImage && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, width, height)
    }

    // Draw username bar
    const barX = logoPosition.x * scale
    const barY = logoPosition.y * scale
    const barWidth = 200 * scale
    const barHeight = 50 * scale

    const bgColor = currentTemplate.style.backgroundColor
    ctx.fillStyle = bgColor
    ctx.fillRect(barX, barY, barWidth, barHeight)

    // Username text
    ctx.fillStyle = currentTemplate.style.textColor
    ctx.font = `${currentTemplate.style.fontWeight} ${Number.parseInt(currentTemplate.style.fontSize) * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"
    ctx.fillText(username, barX + 50 * scale, barY + 30 * scale)

    // Draw logo if available
    if (logoUrl) {
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(barX + 25 * scale, barY + 25 * scale, 20 * scale, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(logoImg, barX + 5 * scale, barY + 5 * scale, 40 * scale, 40 * scale)
        ctx.restore()
      }
      logoImg.src = logoUrl
    } else {
      // Draw default avatar
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(barX + 25 * scale, barY + 25 * scale, 20 * scale, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#000000"
      ctx.font = `bold ${14 * scale}px Inter, Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(username.charAt(1)?.toUpperCase() || "U", barX + 25 * scale, barY + 30 * scale)
    }

    // Draw caption at bottom
    const captionY = height - 120 * scale
    ctx.fillStyle = currentTemplate.style.textColor
    ctx.font = `${currentTemplate.style.fontWeight} ${Number.parseInt(currentTemplate.style.fontSize) * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "left"

    // Word wrap caption
    const words = caption.split(" ")
    const lines = []
    let currentLine = ""
    const maxWidth = width - 40 * scale

    for (const word of words) {
      const testLine = currentLine + word + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine.trim())
        currentLine = word + " "
      } else {
        currentLine = testLine
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, 20 * scale, captionY + index * 30 * scale)
    })

    // Draw watermark
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.font = `${12 * scale}px Inter, Arial, sans-serif`
    ctx.textAlign = "right"
    ctx.fillText("Mikael AI", width - 20 * scale, height - 20 * scale)
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)
    setExportProgress(0)

    try {
      if (isImage && exportFormat === "image") {
        await exportAsImage()
      } else {
        const videoBlob = await createVideoWithOverlays()

        setExportProgress(100)

        const url = URL.createObjectURL(videoBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${username.replace("@", "")}_social_${isImage ? "image" : "video"}_${exportQuality}.webm`
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      }

      setExportSuccess(true)
      setTimeout(() => {
        setExportSuccess(false)
        setExportProgress(0)
      }, 3000)
    } catch (error) {
      console.error("Export failed:", error)
      setVideoError("Export failed. Please try again.")
      setExportProgress(0)
    }

    setIsExporting(false)
  }

  const handleDragLogo = (e: React.MouseEvent) => {
    if (currentTemplate.style.layout === "social") return // No dragging in social layout

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setLogoPosition({
      x: Math.max(0, Math.min(x - 50, rect.width - 100)),
      y: Math.max(0, Math.min(y - 25, rect.height - 50)),
    })
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
                <p className="text-gray-400">Please wait while we load the editor...</p>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (videoError) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen gradient-bg flex items-center justify-center">
            <Card className="bg-gray-900/80 border-gray-800 max-w-md glow-orange">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Media Error</h2>
                <p className="text-gray-400 mb-4">{videoError}</p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="gradient-primary hover:gradient-primary-hover text-black font-semibold"
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!videoData) {
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
                <h2 className="text-xl font-bold text-white mb-2">Loading Media</h2>
                <p className="text-gray-400">Please wait while we load your content...</p>
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
        {/* Hidden canvas for video processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden image for processing */}
        {isImage && (
          <img
            ref={imageRef}
            src={videoData.videoUrl || "/placeholder.svg"}
            alt="Source"
            className="hidden"
            crossOrigin="anonymous"
          />
        )}

        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800 bg-black/50 backdrop-blur-sm px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-white">AI Social Editor</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {exportSuccess && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Export successful!</span>
              </div>
            )}
            {isExporting && exportProgress > 0 && (
              <div className="flex items-center gap-2 text-orange-400">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span className="text-sm">{Math.round(exportProgress)}% complete</span>
              </div>
            )}
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              className="gradient-primary hover:gradient-primary-hover text-black font-semibold"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? `Exporting... ${Math.round(exportProgress)}%` : `Export Post`}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Media Preview */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/50 border-gray-800 glow-orange">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Social Post Preview - {videoData.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`relative bg-white rounded-xl overflow-hidden mx-auto cursor-pointer border border-gray-800 max-w-md`}
                    style={{ aspectRatio: currentTemplate.style.aspectRatio }}
                    onClick={handleDragLogo}
                  >
                    {!videoData?.videoUrl ? (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-400">Loading media...</p>
                        </div>
                      </div>
                    ) : currentTemplate.style.layout === "social" ? (
                      // Social Media Layout
                      <div className="w-full h-full bg-white">
                        {/* Header */}
                        <div className="flex items-center p-4 border-b border-gray-100">
                          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                            {logoUrl ? (
                              <img
                                src={logoUrl || "/placeholder.svg"}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  console.error("Logo failed to load")
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-black text-sm">{displayName}</span>
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                            <span className="text-gray-600 text-sm">{username}</span>
                          </div>
                          <MoreHorizontal className="w-5 h-5 text-gray-600" />
                        </div>

                        {/* Caption */}
                        <div className="p-4">
                          <p className="text-black text-sm leading-relaxed">{caption}</p>
                        </div>

                        {/* Media */}
                        <div className="relative bg-gray-100">
                          {isImage ? (
                            <img
                              src={videoData.videoUrl || "/placeholder.svg"}
                              alt="Post media"
                              className="w-full h-64 object-cover"
                              onError={(e) => {
                                console.error("Image failed to load:", videoData.videoUrl)
                                e.currentTarget.src = "/placeholder.svg?height=256&width=400&text=Image+Failed+to+Load"
                              }}
                              onLoad={() => console.log("Image loaded successfully")}
                            />
                          ) : (
                            <video
                              ref={videoRef}
                              className="w-full h-64 object-cover bg-gray-800"
                              muted={isMuted}
                              onPlay={() => setIsPlaying(true)}
                              onPause={() => setIsPlaying(false)}
                              crossOrigin="anonymous"
                              onError={(e) => {
                                console.error("Video failed to load:", videoData.videoUrl)
                                setVideoError("Failed to load video")
                              }}
                              onLoadStart={() => console.log("Video loading started")}
                              onCanPlay={() => console.log("Video can play")}
                            >
                              {videoData.videoUrl && <source src={videoData.videoUrl} type="video/mp4" />}
                              Your browser does not support the video tag.
                            </video>
                          )}

                          {/* Rest of overlay elements remain the same */}
                          {/* Overlay Text */}
                          {overlayText && (
                            <div className="absolute top-1/3 left-4 right-4">
                              <div className="bg-white/95 rounded-lg p-3 shadow-lg">
                                <p className="text-black font-bold text-center">{overlayText}</p>
                              </div>
                            </div>
                          )}

                          {/* Part Number */}
                          {partNumber && (
                            <div className="absolute top-2/3 left-4">
                              <div className="bg-yellow-400 rounded-lg px-3 py-1">
                                <span className="text-black font-bold text-sm">⚡{partNumber}⚡</span>
                              </div>
                            </div>
                          )}

                          {/* Watermark */}
                          {watermark && (
                            <div className="absolute bottom-2 right-2">
                              <span className="text-white/80 text-xs bg-black/20 px-2 py-1 rounded">{watermark}</span>
                            </div>
                          )}

                          {/* Play Button for Videos */}
                          {!isImage && !isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Button
                                size="lg"
                                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  togglePlay()
                                }}
                              >
                                <Play className="w-8 h-8 text-white ml-1" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Other layouts with similar error handling...
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-400">Template preview loading...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Video Controls */}
              {!isImage && (
                <Card className="bg-gray-900/50 border-gray-800 mt-4 glow-orange">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Video Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="icon" onClick={togglePlay}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1 mx-2">
                        <Slider
                          defaultValue={[0]}
                          max={100}
                          step={0.01}
                          onValueChange={(value) => handleTimelineChange(value)}
                          value={[(currentTime / duration) * 100 || 0]}
                        />
                      </div>
                      <div className="w-24 text-right text-gray-400">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                      <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Settings */}
            <div>
              <Card className="bg-gray-900/50 border-gray-800 glow-orange">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Settings</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Username */}
                  <div>
                    <Label htmlFor="username" className="text-white">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {/* Display Name */}
                  <div>
                    <Label htmlFor="displayName" className="text-white">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {/* Caption */}
                  <div>
                    <Label htmlFor="caption" className="text-white">
                      Caption
                    </Label>
                    <Textarea
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white resize-none"
                    />
                  </div>

                  {/* Overlay Text */}
                  <div>
                    <Label htmlFor="overlayText" className="text-white">
                      Overlay Text
                    </Label>
                    <Input
                      id="overlayText"
                      type="text"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {/* Part Number */}
                  <div>
                    <Label htmlFor="partNumber" className="text-white">
                      Part Number
                    </Label>
                    <Input
                      id="partNumber"
                      type="text"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {/* Watermark */}
                  <div>
                    <Label htmlFor="watermark" className="text-white">
                      Watermark
                    </Label>
                    <Input
                      id="watermark"
                      type="text"
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {/* Template Selection */}
                  <div>
                    <Label className="text-white">Template</Label>
                    <div className="flex gap-2">
                      {templates.map((template) => (
                        <Badge
                          key={template.id}
                          variant={selectedTemplate === template.id ? "default" : "secondary"}
                          onClick={() => setSelectedTemplate(template.id)}
                          className="cursor-pointer"
                        >
                          {template.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Export Quality */}
                  <div>
                    <Label htmlFor="exportQuality" className="text-white">
                      Export Quality
                    </Label>
                    <select
                      id="exportQuality"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white rounded px-2 py-1 w-full"
                    >
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                    </select>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <Label htmlFor="logoUpload" className="text-white">
                      Upload Logo
                    </Label>
                    <Input
                      type="file"
                      id="logoUpload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white w-full justify-start bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {logoFile ? logoFile.name : "Select Logo"}
                    </Button>
                  </div>

                  {/* Image Duration */}
                  {isImage && (
                    <div>
                      <Label htmlFor="imageDuration" className="text-white">
                        Image Duration (seconds)
                      </Label>
                      <Input
                        id="imageDuration"
                        type="number"
                        value={imageDuration}
                        onChange={(e) => setImageDuration(Number(e.target.value))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  )}

                  {/* Export Format */}
                  <div>
                    <Label htmlFor="exportFormat" className="text-white">
                      Export As
                    </Label>
                    <select
                      id="exportFormat"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as "image" | "video")}
                      className="bg-gray-800 border-gray-700 text-white rounded px-2 py-1 w-full"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
