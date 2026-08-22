"use client"

import { PricingCard } from "@/components/ui/pricing-card"
import { FAQSection } from "@/components/ui/faq-section"
import { Button } from "@/components/ui/button"

export function PricingSection() {
  // Pricing tiers based on design specs
  const pricingTiers = [
    {
      name: "Free",
      price: 0,
      period: "mo",
      description: "Perfect for trying",
      isPopular: false,
      features: [
        { text: "10 images per month", included: true },
        { text: "Basic resolution (1024px)", included: true },
        { text: "Text-to-image generation", included: true },
        { text: "Standard processing", included: true },
        { text: "Batch processing", included: false },
        { text: "All export formats (PNG/JPG/WebP)", included: false },
        { text: "No watermarks", included: false },
        { text: "Commercial license included", included: false }
      ],
      ctaText: "Get Started Free",
      ctaAction: () => {
        // Connect to existing auth flow
        window.location.href = "/generator"
      }
    },
    {
      name: "Base",
      price: 19,
      period: "mo",
      description: "Perfect for creators",
      isPopular: true,
      features: [
        { text: "500 images per month", included: true, highlight: true },
        { text: "HD resolution (2048px)", included: true, highlight: true },
        { text: "All generation modes", included: true },
        { text: "Priority processing (2x faster)", included: true, highlight: true },
        { text: "Batch processing (up to 50)", included: true, highlight: true },
        { text: "All export formats (PNG/JPG/WebP)", included: true },
        { text: "No watermarks", included: true },
        { text: "Commercial license included", included: true }
      ],
      ctaText: "Start Base Plan",
      ctaAction: () => {
        // TODO: Connect to payment flow
        alert("Payment integration coming soon!")
      }
    }
  ]

  // FAQ data based on design specs
  const faqs = [
    {
      question: "Can I upgrade anytime?",
      answer: "Yes! Upgrade instantly with immediate access to Base features."
    },
    {
      question: "Do unused images roll over?",
      answer: "Base plan images roll over for up to 2 months."
    },
    {
      question: "Is there a free trial for Base?",
      answer: "Yes! 7-day free trial, no credit card required."
    },
    {
      question: "What if I need more than 500 images?",
      answer: "Contact us for volume pricing - we have flexible options!"
    }
  ]

  return (
    <section id="pricing" className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            💰 Simple, Transparent Pricing
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-8 max-w-4xl mx-auto mb-20">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} {...tier} />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <FAQSection faqs={faqs} />
        </div>

        {/* Limited Time Offer */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-8 mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-foreground mb-2">
              🎯 Limited Time Offer
            </h3>
            <p className="text-lg text-foreground mb-1">
              🎁 Get 50% off your first month!
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Use code: <span className="font-semibold">WELCOME50</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Perfect time to try Base plan
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
            onClick={() => alert("Payment integration coming soon!")}
          >
            Upgrade to Base - $9.50 first month
          </Button>
        </div>
      </div>
    </section>
  )
}