"use client"

import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Elegant Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-6 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 touch-manipulation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="text-xs tracking-wider uppercase font-light hidden sm:inline">Back</span>
          </button>
          <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">Terms of Service</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="bg-white border border-[#E8E8E8] p-8 sm:p-12">
          <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-12 font-light">Last Updated: December 11, 2024</p>

          <p className="text-[#6B6B6B] mb-8 font-light leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of Ivory ("we," "our," or "us"). 
            By creating an account or using the Service, you agree to these Terms.
          </p>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">1. Use of the Service</h2>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">You must:</p>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] font-light leading-relaxed">
              <li>Be at least 18 years old (or the age of legal majority in your region)</li>
              <li>Provide accurate information</li>
              <li>Not misuse or attempt to disrupt the Service</li>
              <li>Use the Service only for lawful purposes</li>
            </ul>
            <p className="text-[#6B6B6B] mt-6 font-light leading-relaxed">
              We may suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">2. Design Tools and AI Output</h2>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">Our Service allows users to:</p>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] mb-6 font-light leading-relaxed">
              <li>Upload images</li>
              <li>Create designs</li>
              <li>Generate AI-enhanced previews</li>
              <li>Share designs with nail technicians</li>
            </ul>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">You acknowledge that:</p>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] font-light leading-relaxed">
              <li>AI-generated designs are previews, not guarantees of results</li>
              <li>Actual nail outcomes depend on the nail technician</li>
              <li>We are not responsible for the accuracy or realism of AI outputs</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">3. User Content</h2>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">
              You retain ownership of your content, including photos and design notes.
            </p>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">By uploading content, you grant us a license to:</p>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] mb-6 font-light leading-relaxed">
              <li>Process it for design creation</li>
              <li>Display it within your account</li>
              <li>Provide it to nail technicians you explicitly select</li>
              <li>Use anonymized, aggregated forms for improving the Service</li>
            </ul>
            <p className="text-muted-foreground">
              You agree not to upload harmful, illegal, or infringing content.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">4. Payments and Fees</h2>
            <p className="text-[#6B6B6B] mb-6 font-light leading-relaxed">
              Payments are processed by third-party providers (e.g., Stripe).
            </p>
            
            <h3 className="text-lg font-normal text-[#1A1A1A] mb-4">4.1 For Clients</h3>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] mb-6 font-light leading-relaxed">
              <li>You agree to pay the booking fees, service fees, and any design enhancement fees as shown at checkout</li>
              <li>Charges are non-refundable except as required by law</li>
            </ul>

            <h3 className="text-lg font-normal text-[#1A1A1A] mb-4">4.2 For Nail Technicians</h3>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] mb-6 font-light leading-relaxed">
              <li>When accepting a booking through the app, you agree to platform commissions and payment terms presented upon onboarding</li>
              <li>Earnings are paid out through integrated payment processors</li>
            </ul>

            <p className="text-muted-foreground">
              We reserve the right to update pricing or fees at any time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">5. Marketplace Disclaimer</h2>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">
              The Service connects clients with independent nail technicians.
            </p>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">We do not:</p>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] mb-6 font-light leading-relaxed">
              <li>Employ any nail techs</li>
              <li>Guarantee the quality of services</li>
              <li>Handle disputes between users and nail techs</li>
            </ul>
            <p className="text-muted-foreground">
              You are solely responsible for selecting and interacting with your nail tech.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">6. Prohibited Activities</h2>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">You may not:</p>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] font-light leading-relaxed">
              <li>Attempt to reverse engineer or misuse the platform</li>
              <li>Circumvent payment systems or booking flows</li>
              <li>Harass users or nail techs</li>
              <li>Use the Service for fraudulent purposes</li>
              <li>Upload inappropriate or harmful content</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">7. Intellectual Property</h2>
            <p className="text-[#6B6B6B] font-light leading-relaxed">
              All platform content (branding, UI, templates, code, etc.) is owned by us and protected under applicable laws. 
              You may not copy, duplicate, or distribute our intellectual property without permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">8. Limitation of Liability</h2>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">To the fullest extent permitted by law:</p>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] mb-6 font-light leading-relaxed">
              <li>We are not liable for indirect, incidental, consequential, or punitive damages</li>
              <li>Our maximum liability is limited to the amount paid by you to us in the last 12 months</li>
            </ul>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">9. Termination</h2>
            <p className="text-[#6B6B6B] mb-4 font-light leading-relaxed">We may suspend or terminate your access if you:</p>
            <ul className="list-disc list-inside space-y-3 text-[#6B6B6B] mb-6 font-light leading-relaxed">
              <li>Violate these Terms</li>
              <li>Misuse the Service</li>
              <li>Engage in harmful behavior</li>
            </ul>
            <p className="text-muted-foreground">
              You may terminate your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">10. Governing Law</h2>
            <p className="text-[#6B6B6B] font-light leading-relaxed">
              These Terms are governed by the laws of the state or country in which the company is registered, 
              without regard to conflict-of-law principles.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">11. Changes</h2>
            <p className="text-[#6B6B6B] font-light leading-relaxed">
              We may update these Terms from time to time. Your continued use of the Service after updates signifies acceptance.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">12. Contact Us</h2>
            <p className="text-[#6B6B6B] mb-6 font-light leading-relaxed">
              For questions regarding these Terms:
            </p>
            <div className="bg-[#FAFAF8] border border-[#E8E8E8] p-6">
              <p className="text-sm text-[#6B6B6B] mb-2 font-light"><span className="text-[#1A1A1A]">Email:</span> support@ivory.app</p>
              <p className="text-sm text-[#6B6B6B] font-light"><span className="text-[#1A1A1A]">Legal:</span> legal@ivory.app</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
