"use client"

import Link from "next/link"
import { FeatureCard } from "@/components/ui/feature-card"
import { StatsDisplay } from "@/components/ui/stats-display"
import { UseCaseGrid } from "@/components/ui/use-case-grid"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  ImageIcon, 
  Zap, 
  Trophy, 
  Users, 
  Palette, 
  Smartphone, 
  ShoppingCart 
} from "lucide-react"

export function FeaturesSection() {
  // Features data based on design specs
  const features = [
    {
      icon: FileText,
      title: "Text-to-Image Generation",
      description: "Create stunning images from text descriptions with professional quality results.",
      benefits: [
        "Multiple art styles available",
        "HD quality output",
        "Instant generation",
        "Natural language prompts"
      ],
      ctaText: "Try Text-to-Image",
      ctaAction: () => window.location.href = "/generator"
    },
    {
      icon: ImageIcon,
      title: "Image Transformation",
      description: "Edit existing images with simple prompts and advanced AI capabilities.",
      benefits: [
        "Style transfer capabilities",
        "Object replacement",
        "Background changes",
        "Precise editing control"
      ],
      ctaText: "Try Image Edit",
      ctaAction: () => window.location.href = "/generator"
    },
    {
      icon: Zap,
      title: "Batch Processing",
      description: "Process multiple images simultaneously with efficient queue management.",
      benefits: [
        "Upload up to 50 images",
        "Queue management system",
        "Bulk download options",
        "Time-saving automation"
      ],
      ctaText: "Try Batch Mode",
      ctaAction: () => window.location.href = "/generator"
    }
  ]

  // Stats data based on design specs
  const stats = [
    { value: "100K+", label: "Images Generated", icon: Trophy },
    { value: "5K+", label: "Users", icon: Users },
    { value: "3x", label: "Faster", icon: Zap }
  ]

  // Use cases data based on design specs
  const useCases = [
    {
      title: "Content Creators",
      examples: [
        "YouTube thumbnails",
        "Blog illustrations", 
        "Video backgrounds"
      ],
      icon: Palette
    },
    {
      title: "Social Media",
      examples: [
        "Instagram posts",
        "Story graphics",
        "Profile pictures"
      ],
      icon: Smartphone
    },
    {
      title: "E-commerce",
      examples: [
        "Product photos",
        "Marketing banners",
        "Website images"
      ],
      icon: ShoppingCart
    }
  ]

  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            🎯 Why Choose Nano Banana?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            The AI image generator that's faster and smarter
          </p>
          <p className="text-sm text-muted-foreground">
            3x faster than competitors • Professional quality • Easy to use
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12 mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Stats Display */}
        <StatsDisplay stats={stats} />

        {/* Use Cases */}
        <UseCaseGrid useCases={useCases} />

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/generator">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg">
              Start Creating Now →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}