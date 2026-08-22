import { ImageEditor } from "@/components/image-editor"

export default function GeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-8xl px-6">
        <ImageEditor />
      </div>
    </div>
  )
}