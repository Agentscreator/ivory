import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
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
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Privacy Policy</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 prose prose-sm sm:prose max-w-none">
          <p className="text-sm text-muted-foreground mb-8">Last Updated: December 11, 2024</p>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Ivory ("we," "our," or "us"). We are committed to protecting your privacy and being transparent 
              about how we collect, use, and share your personal information. This Privacy Policy explains our practices 
              regarding data collection and use when you access or use our nail design platform and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">1. Information We Collect</h2>
            
            <h3 className="font-semibold text-lg mb-3">1.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><strong>Account Information:</strong> Username, email address, password, and user type (client or nail technician)</li>
              <li><strong>Profile Information:</strong> Business name, location, bio, phone number, website, social media handles (for nail techs)</li>
              <li><strong>Design Content:</strong> Photos of hands, nail design images, AI prompts, design notes, and preferences</li>
              <li><strong>Communication Data:</strong> Messages sent to nail technicians, design requests, and responses</li>
              <li><strong>Payment Information:</strong> Processed securely through third-party payment providers (we do not store full payment card details)</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3">1.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, and interaction patterns</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address (with your consent for precise location)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide and maintain our services</li>
              <li>Create and manage your account</li>
              <li>Process your nail design requests and connect you with nail technicians</li>
              <li>Generate AI-enhanced nail design previews</li>
              <li>Process payments and transactions</li>
              <li>Send service-related notifications and updates</li>
              <li>Improve and personalize your experience</li>
              <li>Analyze usage patterns and optimize our platform</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">3. AI-Generated Content</h2>
            <p className="text-muted-foreground mb-3">
              Our platform uses artificial intelligence to generate nail design previews. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>AI-generated designs are previews and not guarantees of final results</li>
              <li>We may use anonymized design data to improve our AI models</li>
              <li>AI outputs depend on the quality of input images and prompts</li>
              <li>Actual nail outcomes depend on the skill of the nail technician</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground mb-3">We share your information only in the following circumstances:</p>
            
            <h3 className="font-semibold text-lg mb-3">4.1 With Nail Technicians</h3>
            <p className="text-muted-foreground mb-3">
              When you send a design request, we share your design images, notes, and contact information with the selected nail technician.
            </p>

            <h3 className="font-semibold text-lg mb-3">4.2 Service Providers</h3>
            <p className="text-muted-foreground mb-3">
              We work with third-party service providers for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Cloud hosting and storage</li>
              <li>Payment processing</li>
              <li>AI model services</li>
              <li>Analytics and performance monitoring</li>
              <li>Email delivery</li>
            </ul>

            <h3 className="font-semibold text-lg mb-3">4.3 Legal Requirements</h3>
            <p className="text-muted-foreground">
              We may disclose information if required by law, court order, or to protect our rights, safety, or property.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">5. Your Rights and Choices</h2>
            <p className="text-muted-foreground mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Object:</strong> Object to certain data processing activities</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, visit your account settings or contact us at the email below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide services. 
              When you delete your account, we will delete or anonymize your personal data within 30 days, except 
              where we are required to retain it for legal, tax, or regulatory purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">7. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your information, including encryption, 
              secure servers, and access controls. However, no method of transmission over the internet is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not intended for users under 18 years of age. We do not knowingly collect information 
              from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">9. International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by 
              posting the new policy on this page and updating the "Last Updated" date. Your continued use of the 
              service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground mb-3">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted/50 p-4 rounded-xl">
              <p className="text-sm"><strong>Email:</strong> privacy@ivory.app</p>
              <p className="text-sm"><strong>Support:</strong> support@ivory.app</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
