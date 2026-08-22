"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, Wand2, Crown, Settings, Palette, Layers, Download, Loader2, AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import type { GenerationMode, GeneratedImage } from "@/lib/types/image"

export function ImageEditor() {
  const [selectedMode, setSelectedMode] = useState<GenerationMode>("text-to-image")
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)
    setProgressMessage('Initializing request...')

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          const increment = Math.random() * 10 + 5
          return Math.min(prev + increment, 90)
        }
        return prev
      })
    }, 500)

    const timeout = setTimeout(() => {
      clearInterval(progressTimer)
      setLoading(false)
      setError('Request timed out. The API might be experiencing high load. Please try again.')
      setProgress(0)
      setProgressMessage('')
    }, 120000) // 2 minutes timeout

    setTimeoutId(timeout)

    try {
      setProgressMessage('Sending request to AI model...')
      setProgressMessage('Processing your prompt...')
      setProgress(30)
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          width: 1024,
          height: 1024,
          numImages: 1,
        }),
      })
      
      setProgressMessage('Parsing response...')
      setProgress(70)

      const data = await response.json()

      if (response.status === 401) {
        setError("Please sign in to generate images")
        // Optionally, trigger login modal
        window.location.href = '/?login=true'
        return
      }

      if (data.success) {
        setProgressMessage('Image generation complete!')
        setProgress(100)
        setGeneratedImages(data.data.images)
      } else {
        setError(data.error?.message || "Failed to generate image")
      }
    } catch (err) {
      console.error("Generation error:", err)
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request was cancelled due to timeout')
      } else {
        setError("Failed to generate image. Please try again.")
      }
    } finally {
      clearInterval(progressTimer)
      if (timeoutId) clearTimeout(timeoutId)
      setLoading(false)
      setTimeout(() => {
        setProgress(0)
        setProgressMessage('')
      }, 2000)
    }
  }

  const transformImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    if (!uploadedImage) {
      setError("Please upload an image first")
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)
    setProgressMessage('Preparing image transformation...')

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          const increment = Math.random() * 8 + 3
          return Math.min(prev + increment, 90)
        }
        return prev
      })
    }, 600)

    const timeout = setTimeout(() => {
      clearInterval(progressTimer)
      setLoading(false)
      setError('Request timed out. Image transformation might be taking longer than expected. Please try again.')
      setProgress(0)
      setProgressMessage('')
    }, 150000) // 2.5 minutes timeout for image transformation

    setTimeoutId(timeout)

    try {
      setProgressMessage('Uploading image...')
      setProgress(20)
      const formData = new FormData()
      formData.append("image", uploadedImage)
      formData.append("prompt", prompt)
      if (negativePrompt) {
        formData.append("negativePrompt", negativePrompt)
      }
      formData.append("strength", "0.7")

      setProgressMessage('Processing image transformation...')
      setProgress(40)
      
      const response = await fetch("/api/transform", {
        method: "POST",
        body: formData,
      })
      
      setProgressMessage('Finalizing transformation...')
      setProgress(80)

      const data = await response.json()

      if (response.status === 401) {
        setError("Please sign in to transform images")
        // Optionally, trigger login modal
        window.location.href = '/?login=true'
        return
      }

      if (data.success) {
        setProgressMessage('Transformation complete!')
        setProgress(100)
        setGeneratedImages(data.data.images)
      } else {
        setError(data.error?.message || "Failed to transform image")
      }
    } catch (err) {
      console.error("Transform error:", err)
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request was cancelled due to timeout')
      } else {
        setError("Failed to transform image. Please try again.")
      }
    } finally {
      clearInterval(progressTimer)
      if (timeoutId) clearTimeout(timeoutId)
      setLoading(false)
      setTimeout(() => {
        setProgress(0)
        setProgressMessage('')
      }, 2000)
    }
  }

  const handleGenerate = () => {
    if (selectedMode === "text-to-image") {
      generateImage()
    } else {
      transformImage()
    }
  }

  const downloadImage = (imageUrl: string, imageName: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = imageName
    link.click()
  }

  const clearResults = () => {
    setGeneratedImages([])
    setError(null)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Panel - Editing Controls */}
        <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Image Generator</CardTitle>
                  <p className="text-sm text-muted-foreground">Create stunning images with Google Nano Banana</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Selection */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedMode("text-to-image")
                    clearResults()
                  }}
                  className={
                    selectedMode === "text-to-image"
                      ? "bg-primary text-primary-foreground flex-1"
                      : "bg-accent/20 text-accent-foreground flex-1"
                  }
                  disabled={loading}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Text to Image
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMode("image-to-image")
                    clearResults()
                  }}
                  className={
                    selectedMode === "image-to-image"
                      ? "bg-primary text-primary-foreground flex-1"
                      : "bg-accent/20 text-accent-foreground flex-1"
                  }
                  disabled={loading}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image to Image
                </Button>
              </div>

              {/* Progress Indicator */}
              {loading && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">{progressMessage || 'Processing...'}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% complete</span>
                    <span>Est. 1-2 minutes</span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Reference Image Upload - Only show in image-to-image mode */}
          {selectedMode === "image-to-image" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Reference Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={loading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploadedImagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={uploadedImagePreview}
                          alt="Uploaded"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">Click to change image</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="font-medium text-foreground">Upload Image</p>
                        <p className="text-sm text-muted-foreground">JPEG, PNG, or WebP (Max 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Main Prompt</label>
                <Textarea
                  placeholder={
                    selectedMode === "text-to-image"
                      ? "A futuristic city powered by nano technology, golden hour lighting, ultra detailed..."
                      : "Transform this image into a cyberpunk style with neon lights..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Negative Prompt (Optional)</label>
                <Textarea
                  placeholder="Things to avoid: blurry, low quality, distorted..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="min-h-[60px] resize-none"
                  disabled={loading}
                />
              </div>

              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearResults}
                  disabled={loading || generatedImages.length === 0}
                >
                  Clear Results
                </Button>
                <Button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim() || (selectedMode === "image-to-image" && !uploadedImage)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Output Gallery */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Output Gallery</CardTitle>
              <p className="text-sm text-muted-foreground">
                {generatedImages.length > 0 
                  ? `${generatedImages.length} image${generatedImages.length > 1 ? 's' : ''} generated`
                  : "Your AI creations will appear here"}
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              {generatedImages.length > 0 ? (
                <div className="space-y-4">
                  {generatedImages.map((image, index) => (
                    <div key={image.id} className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-border">
                        <img
                          src={image.url}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-auto"
                        />
                        {loading && index === generatedImages.length - 1 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          {image.width}x{image.height} • {image.format.toUpperCase()}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadImage(image.url, `generated-${image.id}.${image.format}`)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {loading ? "Generating..." : "Ready to generate"}
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      {loading 
                        ? "Please wait while we create your image..."
                        : selectedMode === "text-to-image"
                        ? "Enter a prompt and click Generate to create an image"
                        : "Upload an image, enter a prompt, and click Generate to transform it"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
