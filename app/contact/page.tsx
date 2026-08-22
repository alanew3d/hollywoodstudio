import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  Send, 
  Clock,
  MapPin,
  Phone,
  Globe,
  Twitter,
  Github,
  Heart,
  Zap,
  Users
} from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center gap-2 mb-6">
            <span className="text-5xl animate-pulse">📧</span>
            <span className="text-5xl animate-pulse" style={{ animationDelay: "0.2s" }}>💬</span>
            <span className="text-5xl animate-pulse" style={{ animationDelay: "0.4s" }}>🤝</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions, feedback, or just want to say hello.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Email */}
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 pb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                General inquiries and support
              </p>
              <Link 
                href="mailto:contact@nanoart.app" 
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                contact@nanoart.app
                <Send className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Response Time</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We typically respond within
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                24 Hours
              </Badge>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join our growing community
              </p>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Contact Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Form Area */}
          <Card>
            <CardContent className="pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Send us a Message</h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Ready to get started? Send us an email and we'll get back to you as soon as possible.
                </p>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">What to include:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Describe your question or issue clearly</li>
                    <li>Include any error messages you've seen</li>
                    <li>Let us know what you were trying to do</li>
                    <li>Attach screenshots if helpful</li>
                  </ul>
                </div>

                <Link href="mailto:contact@nanoart.app?subject=nanoart Inquiry">
                  <Button className="w-full" size="lg">
                    <Mail className="mr-2 h-4 w-4" />
                    Compose Email
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Quick Links */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-semibold mb-6">Quick Help</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Technical Issues</h4>
                      <p className="text-sm text-muted-foreground">
                        Having trouble with image generation? Check your internet connection and try refreshing the page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Feature Requests</h4>
                      <p className="text-sm text-muted-foreground">
                        Have ideas for new features? We'd love to hear them! Send us your suggestions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Account Issues</h4>
                      <p className="text-sm text-muted-foreground">
                        Problems with sign-in or your account? We can help you get back on track.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Contact */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Business Inquiries</h2>
              <p className="text-lg text-muted-foreground">
                Interested in partnerships, API access, or enterprise solutions?
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Partnerships</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore collaboration opportunities
                </p>
                <Link 
                  href="mailto:partnerships@nanoart.app?subject=Partnership Inquiry"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  partnerships@nanoart.app
                </Link>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Custom solutions for your business
                </p>
                <Link 
                  href="mailto:enterprise@nanoart.app?subject=Enterprise Inquiry"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  enterprise@nanoart.app
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
              <p className="text-lg mb-6 opacity-90">
                Follow us for updates, tips, and community highlights
              </p>
              <div className="flex justify-center gap-4">
                <Link 
                  href="https://twitter.com" 
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link 
                  href="https://github.com" 
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
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