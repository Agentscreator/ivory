import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Terms of Service</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 prose prose-sm sm:prose max-w-none">
          <p className="text-sm text-muted-foreground mb-8">Last Updated: December 11, 2024</p>

          <p className="text-muted-foreground mb-6">
            These Terms of Service ("Terms") govern your access to and use of Ivory ("we," "our," or "us"). 
            By creating an account or using the Service, you agree to these Terms.
          </p>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">1. Use of the Service</h2>
            <p className="text-muted-foreground mb-3">You must:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Be at least 18 years old (or the age of legal majority in your region)</li>
              <li>Provide accurate information</li>
              <li>Not misuse or attempt to disrupt the Service</li>
              <li>Use the Service only for lawful purposes</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We may suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">2. Design Tools and AI Output</h2>
            <p className="text-muted-foreground mb-3">Our Service allows users to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Upload images</li>
              <li>Create designs</li>
              <li>Generate AI-enhanced previews</li>
              <li>Share designs with nail technicians</li>
            </ul>
            <p className="text-muted-foreground mb-3">You acknowledge that:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>AI-generated designs are previews, not guarantees of results</li>
              <li>Actual nail outcomes depend on the nail technician</li>
              <li>We are not responsible for the accuracy or realism of AI outputs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">3. User Content</h2>
            <p className="text-muted-foreground mb-3">
              You retain ownership of your content, including photos and design notes.
            </p>
            <p className="text-muted-foreground mb-3">By uploading content, you grant us a license to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Process it for design creation</li>
              <li>Display it within your account</li>
              <li>Provide it to nail technicians you explicitly select</li>
              <li>Use anonymized, aggregated forms for improving the Service</li>
            </ul>
            <p className="text-muted-foreground">
              You agree not to upload harmful, illegal, or infringing content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">4. Payments and Fees</h2>
            <p className="text-muted-foreground mb-4">
              Payments are processed by third-party providers (e.g., Stripe).
            </p>
            
            <h3 className="font-semibold text-lg mb-3">4.1 For Clients</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>You agree to pay the booking fees, service fees, and any design enhancement fees as shown at checkout</li>
              <li>Charges are non-refundable except as required by law</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3">4.2 For Nail Technicians</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>When accepting a booking through the app, you agree to platform commissions and payment terms presented upon onboarding</li>
              <li>Earnings are paid out through integrated payment processors</li>
            </ul>

            <p className="text-muted-foreground">
              We reserve the right to update pricing or fees at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">5. Marketplace Disclaimer</h2>
            <p className="text-muted-foreground mb-3">
              The Service connects clients with independent nail technicians.
            </p>
            <p className="text-muted-foreground mb-3">We do not:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Employ any nail techs</li>
              <li>Guarantee the quality of services</li>
              <li>Handle disputes between users and nail techs</li>
            </ul>
            <p className="text-muted-foreground">
              You are solely responsible for selecting and interacting with your nail tech.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">6. Prohibited Activities</h2>
            <p className="text-muted-foreground mb-3">You may not:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Attempt to reverse engineer or misuse the platform</li>
              <li>Circumvent payment systems or booking flows</li>
              <li>Harass users or nail techs</li>
              <li>Use the Service for fraudulent purposes</li>
              <li>Upload inappropriate or harmful content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All platform content (branding, UI, templates, code, etc.) is owned by us and protected under applicable laws. 
              You may not copy, duplicate, or distribute our intellectual property without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-3">To the fullest extent permitted by law:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>We are not liable for indirect, incidental, consequential, or punitive damages</li>
              <li>Our maximum liability is limited to the amount paid by you to us in the last 12 months</li>
            </ul>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">9. Termination</h2>
            <p className="text-muted-foreground mb-3">We may suspend or terminate your access if you:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Violate these Terms</li>
              <li>Misuse the Service</li>
              <li>Engage in harmful behavior</li>
            </ul>
            <p className="text-muted-foreground">
              You may terminate your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of the state or country in which the company is registered, 
              without regard to conflict-of-law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">11. Changes</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. Your continued use of the Service after updates signifies acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground mb-3">
              For questions regarding these Terms:
            </p>
            <div className="bg-muted/50 p-4 rounded-xl">
              <p className="text-sm"><strong>Email:</strong> support@ivory.app</p>
              <p className="text-sm"><strong>Legal:</strong> legal@ivory.app</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
