import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  benefits: string[]
  ctaText: string
  ctaAction: () => void
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  benefits,
  ctaText,
  ctaAction
}: FeatureCardProps) {
  return (
    <Card className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow h-full">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Icon and Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>

        {/* Benefits List */}
        <div className="space-y-3 mb-8 flex-grow">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
              <span className="text-sm text-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={ctaAction}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  )
}