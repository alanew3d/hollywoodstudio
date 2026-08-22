"use client"

import { ExampleItem } from "@/types/examples"
import { BeforeAfterSlider } from "./before-after-slider"
import { Badge } from "./badge"
import { Button } from "./button"
import { Clock, Eye, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExampleCardProps {
  example: ExampleItem
  onViewDetails: (example: ExampleItem) => void
  className?: string
}

export function ExampleCard({ example, onViewDetails, className }: ExampleCardProps) {
  const handleViewDetails = () => {
    onViewDetails(example)
  }

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group",
      className
    )}>
      {/* Image Section */}
      <div className="relative">
        <BeforeAfterSlider
          beforeImage={example.beforeImage}
          afterImage={example.afterImage}
          beforeLabel="Original"
          afterLabel="Enhanced"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs font-medium">
            {example.category === 'text-to-image' && '📝 Text→Image'}
            {example.category === 'image-edit' && '🖼️ Image Edit'}
            {example.category === 'style-transfer' && '🎨 Style Transfer'}
          </Badge>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3 z-20">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium border-white/50 text-white bg-black/50",
              example.difficulty === 'Easy' && "border-green-400 text-green-100",
              example.difficulty === 'Medium' && "border-yellow-400 text-yellow-100", 
              example.difficulty === 'Advanced' && "border-red-400 text-red-100"
            )}
          >
            {example.difficulty}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 md:p-6">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
            {example.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {example.description}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{example.generationTime}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-600 font-medium">Fast</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {example.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
          {example.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              +{example.tags.length - 3} more
            </span>
          )}
        </div>

        {/* User Testimonial */}
        {example.userTestimonial && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded-r">
            <p className="text-sm italic text-gray-700 mb-1">
              "{example.userTestimonial}"
            </p>
            {example.userName && (
              <p className="text-xs text-gray-500 font-medium">
                — {example.userName}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleViewDetails}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium group-hover:shadow-md transition-all duration-300"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>
    </div>
  )
}