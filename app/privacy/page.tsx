import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, Users, Globe, Mail } from "lucide-react"

export default function PrivacyPolicy() {
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
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Your privacy is important to us at nanoart
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 2025
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                nanoart ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI image generation service at nanoart.app. Please read this policy carefully to understand our views and practices regarding your personal data.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Email address (when you sign in with Google)</li>
                    <li>Name (from your Google profile)</li>
                    <li>Profile picture (from your Google profile)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Images you upload or generate</li>
                    <li>Text prompts and descriptions</li>
                    <li>Service usage patterns and preferences</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cookies and Tracking</h3>
                  <p className="ml-4">
                    We use essential cookies to maintain your session and preferences. Analytics cookies help us understand how you use our service to improve it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" />
                How We Use Your Information
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide and maintain our AI image generation service</li>
                  <li>Process your image generation requests</li>
                  <li>Improve our AI models and service quality</li>
                  <li>Communicate with you about service updates</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Storage and Security */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Your data is stored securely using industry-standard encryption. We use Supabase for authentication and data storage, which provides enterprise-grade security features.
                </p>
                <p>
                  Generated images are stored temporarily for your access and are automatically deleted after 30 days unless you choose to save them to your account.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Third-Party Services
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>We use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Google OAuth:</strong> For secure authentication</li>
                  <li><strong>Supabase:</strong> For data storage and authentication</li>
                  <li><strong>Google Nano Banana API:</strong> For AI image generation</li>
                  <li><strong>Vercel Analytics:</strong> For website performance monitoring</li>
                </ul>
                <p className="mt-3">
                  Each third-party service has its own privacy policy. We encourage you to review their policies.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Under GDPR and CCPA, you have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to data processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at privacy@nanoart.app
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Contact Us
              </h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: privacy@nanoart.app</p>
                <p>Website: nanoart.app</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}