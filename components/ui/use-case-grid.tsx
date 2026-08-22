import { LucideIcon } from "lucide-react"

interface UseCase {
  title: string
  examples: string[]
  icon: LucideIcon
}

interface UseCaseGridProps {
  useCases: UseCase[]
}

export function UseCaseGrid({ useCases }: UseCaseGridProps) {
  return (
    <div>
      <h3 className="text-2xl font-bold text-center mb-12 text-foreground">
        🎯 Perfect For
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {useCases.map((useCase, index) => (
          <div 
            key={index}
            className="text-center p-6 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
          >
            {/* Icon and Title */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <useCase.icon className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">
                {useCase.title}
              </h4>
            </div>

            {/* Examples List */}
            <div className="space-y-2">
              {useCase.examples.map((example, exampleIndex) => (
                <div 
                  key={exampleIndex} 
                  className="text-sm text-muted-foreground"
                >
                  • {example}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}