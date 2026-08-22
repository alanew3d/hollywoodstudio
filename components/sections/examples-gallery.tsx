"use client"

import { useState, useMemo } from "react"
import { ExampleItem, ExampleCategory } from "@/types/examples"
import { EXAMPLE_DATA, CATEGORY_INFO, getExamplesByCategory } from "@/data/example-data"
import { CategoryTabs } from "@/components/ui/category-tabs"
import { ExampleCard } from "@/components/ui/example-card"
import { ExampleModal } from "@/components/ui/example-modal"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ExamplesGallery() {
  const [activeCategory, setActiveCategory] = useState<ExampleCategory | 'all'>('all')
  const [selectedExample, setSelectedExample] = useState<ExampleItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter examples based on active category
  const filteredExamples = useMemo(() => {
    return getExamplesByCategory(activeCategory)
  }, [activeCategory])

  const handleViewDetails = (example: ExampleItem) => {
    setSelectedExample(example)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedExample(null)
  }

  const handleTryPrompt = (prompt: string) => {
    // Store prompt in localStorage for the generator page
    localStorage.setItem('aiGeneratorPrompt', prompt)
    // Navigate to generator with the prompt
    window.location.href = '/generator?prompt=' + encodeURIComponent(prompt)
  }

  // Success stories data
  const successStories = [
    { text: "Saved me hours of Photoshop work!", author: "Sarah M., Content Creator" },
    { text: "The quality is incredible for my e-commerce store", author: "Mike L., Store Owner" },
    { text: "My social media engagement doubled!", author: "Jessica R., Influencer" }
  ]

  return (
    <section id="examples" className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            🎨 See What's Possible
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            From simple prompts to stunning results - all in seconds
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Real transformations from our users • Click any image to explore the magic behind it
          </p>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          categories={CATEGORY_INFO}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {filteredExamples.map((example) => (
            <ExampleCard
              key={example.id}
              example={example}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* No Results Message */}
        {filteredExamples.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No examples found for this category
            </h3>
            <p className="text-gray-500">
              Try selecting a different category or view all examples
            </p>
          </div>
        )}

        {/* User Success Stories */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-16">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-8">
            ✨ What Our Users Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div key={index} className="text-center">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-3">
                  <p className="italic text-gray-700 text-sm md:text-base">
                    "{story.text}"
                  </p>
                </div>
                <p className="text-xs font-medium text-gray-500">
                  — {story.author}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to Create Your Own Magic?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of creators using Nano Banana to transform their ideas into stunning visuals
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/generator" className="flex-1">
              <Button 
                size="lg"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Now
              </Button>
            </Link>
            <Link href="/#pricing" className="flex-1">
              <Button 
                size="lg"
                variant="outline"
                className="w-full border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-semibold"
              >
                View Pricing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3">
              Or start with our most popular prompts:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Professional headshot", "Anime style portrait", "Product photography"].map((prompt) => (
                <Button
                  key={prompt}
                  onClick={() => handleTryPrompt(prompt)}
                  variant="ghost"
                  size="sm"
                  className="text-xs border border-gray-200 hover:bg-white hover:shadow-md"
                >
                  "{prompt}"
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Example Detail Modal */}
        <ExampleModal
          example={selectedExample}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onTryPrompt={handleTryPrompt}
        />
      </div>
    </section>
  )
}