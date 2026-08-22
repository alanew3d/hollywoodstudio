import { LucideIcon } from "lucide-react"

interface Stat {
  value: string
  label: string
  icon: LucideIcon
}

interface StatsDisplayProps {
  stats: Stat[]
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-8 mb-16">
      <h3 className="text-lg font-semibold text-center mb-8 text-foreground">
        📊 Trusted by Creators
      </h3>
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}