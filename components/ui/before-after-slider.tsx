"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BeforeAfterSliderProps {
  beforeImage?: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Before", 
  afterLabel = "After",
  className 
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isSliding, setIsSliding] = useState(false)

  // If no before image, show only the after image
  if (!beforeImage) {
    return (
      <div className={cn("relative aspect-video overflow-hidden rounded-lg", className)}>
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {afterLabel}
        </div>
      </div>
    )
  }

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSliding) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100)
    setSliderPosition(percentage)
  }

  return (
    <div 
      className={cn("relative aspect-video overflow-hidden rounded-lg cursor-col-resize", className)}
      onMouseDown={() => setIsSliding(true)}
      onMouseUp={() => setIsSliding(false)}
      onMouseLeave={() => setIsSliding(false)}
      onMouseMove={handleSliderMove}
    >
      {/* After Image (Background) */}
      <Image
        src={afterImage}
        alt={afterLabel}
        fill
        className="object-cover"
      />
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover"
        />
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto cursor-col-resize">
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-1 h-4 bg-gray-400 mx-0.5"></div>
            <div className="w-1 h-4 bg-gray-400 mx-0.5"></div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
        {beforeLabel}
      </div>
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
        {afterLabel}
      </div>

      {/* Instruction Overlay (shown on hover) */}
      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white/90 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium">
          Drag to compare
        </div>
      </div>
    </div>
  )
}