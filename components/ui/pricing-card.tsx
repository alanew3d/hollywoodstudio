import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

interface PricingFeature {
  text: string
  included: boolean
  highlight?: boolean
}

interface PricingCardProps {
  name: string
  price: number
  period: string
  description: string
  features: PricingFeature[]
  isPopular?: boolean
  ctaText: string
  ctaAction: () => void
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  isPopular,
  ctaText,
  ctaAction
}: PricingCardProps) {
  return (
    <Card className={`bg-white rounded-xl border-2 p-8 relative hover:shadow-lg transition-all ${
      isPopular ? 'border-yellow-500 shadow-md' : 'border-gray-200'
    } flex-1`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            ⭐ POPULAR
          </Badge>
        </div>
      )}

      <CardContent className="p-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">{name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-foreground">${price}</span>
            <span className="text-muted-foreground">/{period}</span>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Features List */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                feature.included 
                  ? 'text-foreground' 
                  : 'text-muted-foreground line-through'
              } ${feature.highlight ? 'font-semibold' : ''}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={ctaAction}
          className={`w-full font-semibold py-3 px-6 text-base transition-colors ${
            isPopular 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
              : 'bg-gray-100 hover:bg-gray-200 text-foreground border border-gray-300'
          }`}
          variant={isPopular ? 'default' : 'outline'}
        >
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  )
}