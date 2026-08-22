import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  Zap, 
  Globe, 
  Heart, 
  Rocket, 
  Users,
  Code,
  Palette,
  Target,
  Trophy,
  Star
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-6xl animate-pulse">🎨</span>
            <span className="text-6xl animate-pulse" style={{ animationDelay: "0.2s" }}>✨</span>
            <span className="text-6xl animate-pulse" style={{ animationDelay: "0.4s" }}>🚀</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">About</span>{" "}
            <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">nanoart</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Where cutting-edge AI technology meets creative expression, powered by Google's revolutionary Nano Banana model.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              To democratize AI-powered creativity by making advanced image generation technology accessible, intuitive, and delightful for everyone—from professional designers to curious beginners.
            </p>
          </CardContent>
        </Card>

        {/* Story Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Our Story */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold">Our Story</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                nanoart was born from a simple observation: while AI image generation had become incredibly powerful, it remained frustratingly complex for most users. We partnered with Google to harness their Nano Banana technology, creating an interface that makes professional-quality image generation as easy as describing what you imagine.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                What started as an experiment has grown into a platform used by thousands of creators worldwide, generating millions of stunning images every month.
              </p>
            </CardContent>
          </Card>

          {/* The Technology */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-2xl font-semibold">The Technology</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                At the heart of nanoart lies Google's Nano Banana model—a breakthrough in AI that delivers unprecedented speed and quality. This cutting-edge technology processes natural language with remarkable accuracy, understanding context, style, and artistic intent.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Unlike traditional models, Nano Banana excels at maintaining consistency across transformations, preserving the essence of your original vision while applying stunning modifications.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-7 h-7 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">User-First Design</h4>
                <p className="text-sm text-muted-foreground">
                  Every feature we build starts with a simple question: How can we make this easier and more delightful?
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-7 h-7 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Accessible Innovation</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced technology shouldn't require advanced degrees. We make AI accessible to everyone.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Palette className="w-7 h-7 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Creative Freedom</h4>
                <p className="text-sm text-muted-foreground">
                  Your imagination is the only limit. We provide the tools to bring any vision to life.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features That Set Us Apart */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
              <h2 className="text-3xl font-bold">What Sets Us Apart</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Lightning Fast</h4>
                  <p className="text-sm text-muted-foreground">3x faster than leading competitors</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Superior Quality</h4>
                  <p className="text-sm text-muted-foreground">Professional-grade results every time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">User Friendly</h4>
                  <p className="text-sm text-muted-foreground">No technical knowledge required</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Constantly Evolving</h4>
                  <p className="text-sm text-muted-foreground">Regular updates with new features</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Future */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">The Road Ahead</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                We're just getting started. Our roadmap is packed with exciting features that will push the boundaries of what's possible with AI creativity.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <Badge className="mb-2" variant="outline">Coming Soon</Badge>
                <p className="font-semibold">Video Generation</p>
                <p className="text-sm text-muted-foreground mt-1">Transform images into dynamic videos</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Badge className="mb-2" variant="outline">In Development</Badge>
                <p className="font-semibold">3D Models</p>
                <p className="text-sm text-muted-foreground mt-1">Generate 3D assets from descriptions</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Badge className="mb-2" variant="outline">Planned</Badge>
                <p className="font-semibold">Real-time Collaboration</p>
                <p className="text-sm text-muted-foreground mt-1">Create together with your team</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section (Placeholder) */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold text-center mb-4">Built by Creators, for Creators</h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-8">
              Our team brings together AI researchers, designers, and artists united by a passion for making creativity accessible to everyone.
            </p>
            <div className="text-center">
              <p className="text-muted-foreground">
                We're a distributed team working from around the world, connected by our mission to democratize AI creativity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Let's Create Together</h2>
              <p className="text-lg mb-6 opacity-90">
                Have questions, suggestions, or just want to say hi? We'd love to hear from you!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/generator">
                  <Button size="lg" variant="secondary">
                    Try nanoart Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="mailto:contact@nanoart.app">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}