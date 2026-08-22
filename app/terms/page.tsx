import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Scale, AlertCircle, CheckCircle, UserCheck, Ban, Gavel } from "lucide-react"

export default function TermsOfService() {
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
              <Scale className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Please read these terms carefully before using nanoart
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Effective Date: January 2025
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using nanoart ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have permission to access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  nanoart provides AI-powered image generation and transformation services using Google Nano Banana technology. Our service allows users to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Generate images from text descriptions</li>
                  <li>Transform existing images with AI</li>
                  <li>Process multiple images in batch</li>
                  <li>Access generated content through our web platform</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-primary" />
                3. User Accounts
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintaining the confidentiality of your account</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
                <p className="mt-3">
                  You must be at least 13 years old to use this Service. By using the Service, you represent that you are at least 13 years of age.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-primary" />
                4. Acceptable Use Policy
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Generate illegal, harmful, or offensive content</li>
                  <li>Violate any local, state, national, or international law</li>
                  <li>Infringe upon intellectual property rights of others</li>
                  <li>Generate deepfakes or misleading content intended to deceive</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use the Service for any commercial purposes without our permission</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Your Content</h3>
                  <p>
                    You retain all rights to the images you upload. By uploading content, you grant us a limited license to process and transform your images as necessary to provide the Service.
                  </p>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground mb-2">Generated Content</h3>
                  <p>
                    Images generated through our Service are owned by you, subject to these Terms. You are responsible for ensuring that your use of generated content complies with all applicable laws and doesn't infringe on third-party rights.
                  </p>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground mb-2">Our Property</h3>
                  <p>
                    The Service and its original content (excluding user content), features, and functionality are owned by nanoart and are protected by international copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-primary" />
                6. Disclaimers and Limitations
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="uppercase font-semibold text-foreground">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
                </p>
                <p>
                  We do not guarantee that the Service will be uninterrupted, secure, or error-free. We are not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>The accuracy or quality of generated content</li>
                  <li>Any loss of data or content</li>
                  <li>Any damages arising from your use of the Service</li>
                  <li>Third-party content or services linked from our Service</li>
                </ul>
                <p className="mt-3">
                  In no event shall nanoart be liable for any indirect, incidental, special, consequential, or punitive damages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Ban className="w-6 h-6 text-primary" />
                7. Termination
              </h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms. Upon termination, your right to use the Service will cease immediately. All provisions of these Terms which by their nature should survive termination shall survive.
              </p>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">8. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to defend, indemnify, and hold harmless nanoart and its licensees and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Gavel className="w-6 h-6 text-primary" />
                9. Governing Law
              </h2>
              <p className="text-muted-foreground">
                These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: legal@nanoart.app</p>
                <p>Website: nanoart.app</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-muted-foreground">
            By using nanoart, you acknowledge that you have read and agree to these Terms of Service.
          </p>
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