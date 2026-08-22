"use client"

import { ExampleItem } from "@/types/examples"
import { BeforeAfterSlider } from "./before-after-slider"
import { Badge } from "./badge"
import { Button } from "./button"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Clock, Zap, Copy, Download, ExternalLink, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ExampleModalProps {
  example: ExampleItem | null
  isOpen: boolean
  onClose: () => void
  onTryPrompt?: (prompt: string) => void
}

export function ExampleModal({ example, isOpen, onClose, onTryPrompt }: ExampleModalProps) {
  if (!example) return null

  const handleTryPrompt = () => {
    if (example.prompt && onTryPrompt) {
      onTryPrompt(example.prompt)
    }
  }

  const handleCopyPrompt = async () => {
    if (example.prompt) {
      try {
        await navigator.clipboard.writeText(example.prompt)
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy prompt:', err)
      }
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-6xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  {example.category === 'text-to-image' && '📝 Text-to-Image'}
                  {example.category === 'image-edit' && '🖼️ Image Editing'}
                  {example.category === 'style-transfer' && '🎨 Style Transfer'}
                </Badge>
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    example.difficulty === 'Easy' && "border-green-400 text-green-700 bg-green-50",
                    example.difficulty === 'Medium' && "border-yellow-400 text-yellow-700 bg-yellow-50", 
                    example.difficulty === 'Advanced' && "border-red-400 text-red-700 bg-red-50"
                  )}
                >
                  {example.difficulty}
                </Badge>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            
            {/* Title and Description */}
            <div className="text-center">
              <Dialog.Title className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {example.title}
              </Dialog.Title>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {example.description}
              </p>
            </div>

            {/* Image Comparison */}
            <div className="max-w-4xl mx-auto">
              <BeforeAfterSlider
                beforeImage={example.beforeImage}
                afterImage={example.afterImage}
                beforeLabel="Original"
                afterLabel="Enhanced"
                className="aspect-video md:aspect-[16/9]"
              />
            </div>

            {/* Stats and Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Generation Time: {example.generationTime}s</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-yellow-700">Nano Banana v2.5</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-700">AI Enhanced</span>
              </div>
            </div>

            {/* Prompt Section */}
            {example.prompt && (
              <div className="bg-gray-50 rounded-xl p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Prompt Used:</h3>
                  <Button
                    onClick={handleCopyPrompt}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <code className="text-sm text-gray-800 font-mono leading-relaxed">
                    {example.prompt}
                  </code>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Tags:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {example.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-gray-700 rounded-full text-sm font-medium border border-yellow-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* User Testimonial */}
            {example.userTestimonial && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <p className="text-lg italic text-gray-800 mb-3">
                    "{example.userTestimonial}"
                  </p>
                  {example.userName && (
                    <p className="text-sm font-semibold text-gray-600">
                      — {example.userName}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
              {example.prompt && (
                <Button
                  onClick={handleTryPrompt}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try This Prompt
                </Button>
              )}
              
              <Link href="/generator" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-semibold"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Open Generator
                </Button>
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Ready to create your own AI masterpiece?
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}