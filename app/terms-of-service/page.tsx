import { Metadata } from "next"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: "Terms of Service - SlideIn",
  description: "Terms of Service for SlideIn - Your AI Email Assistant",
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="container max-w-3xl mx-auto py-8 px-4">
          <Logo size="lg" />
        </div>
      </div>

      <div className="container max-w-3xl mx-auto py-12 px-4">
        {/* Document Header */}
        <div className="mb-12 space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">Terms of Service</h1>
          <p className="text-gray-500">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Introduction */}
        <div className="mb-10 bg-pink-50 border border-pink-100 rounded-lg p-4">
          <p className="text-gray-600">
            These Terms of Service ("Terms") govern your use of SlideIn ("we," "our," or "us"), an AI-powered email assistant service. 
            By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">Contents</h2>
          <nav className="space-y-1">
            {[
              { id: "acceptance", title: "Acceptance of Terms" },
              { id: "service-description", title: "Service Description" },
              { id: "user-accounts", title: "User Accounts and Registration" },
              { id: "acceptable-use", title: "Acceptable Use Policy" },
              { id: "prohibited-activities", title: "Prohibited Activities" },
              { id: "email-compliance", title: "Email Compliance and Anti-Spam" },
              { id: "intellectual-property", title: "Intellectual Property Rights" },
              { id: "third-party-services", title: "Third-Party Services" },
              { id: "privacy", title: "Privacy and Data Protection" },
              { id: "service-availability", title: "Service Availability and Modifications" },
              { id: "termination", title: "Termination" },
              { id: "disclaimers", title: "Disclaimers and Warranties" },
              { id: "limitation-liability", title: "Limitation of Liability" },
              { id: "indemnification", title: "Indemnification" },
              { id: "governing-law", title: "Governing Law" },
              { id: "changes", title: "Changes to Terms" },
              { id: "contact", title: "Contact Information" },
            ].map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-gray-600 hover:text-pink-600"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          <section id="acceptance">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-gray-600">
                By creating an account, accessing, or using SlideIn, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. These Terms constitute a legally binding agreement between you and SlideIn.
              </p>
            </div>
          </section>

          <section id="service-description">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Description</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                SlideIn is an AI-powered email assistant that helps users create, personalize, and send professional emails. Our services include:
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>AI-generated email content and templates</li>
                  <li>Email personalization and optimization</li>
                  <li>Email tracking and analytics (optional)</li>
                  <li>Integration with Gmail and Outlook</li>
                  <li>Automated follow-up sequences</li>
                  <li>Performance analytics and insights</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="user-accounts">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Accounts and Registration</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Account Requirements</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>You must be at least 13 years old to use our services</li>
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Account Responsibility</h3>
                <p className="text-gray-600">
                  You are fully responsible for all activities that occur under your account, including any emails sent through our service. 
                  Keep your login credentials secure and do not share them with others.
                </p>
              </div>
            </div>
          </section>

          <section id="acceptable-use">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptable Use Policy</h2>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">You agree to use SlideIn only for lawful purposes and in accordance with these Terms. Acceptable uses include:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Professional business communications</li>
                <li>Personal correspondence and networking</li>
                <li>Marketing communications to consenting recipients</li>
                <li>Educational and research purposes</li>
                <li>Customer support and service communications</li>
              </ul>
            </div>
          </section>

          <section id="prohibited-activities">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">You may NOT use SlideIn for:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Sending spam, unsolicited bulk emails, or mass marketing to non-consenting recipients</li>
                <li>Harassment, threats, or abusive communications</li>
                <li>Illegal activities, fraud, or deception</li>
                <li>Phishing, malware distribution, or security threats</li>
                <li>Violating intellectual property rights</li>
                <li>Circumventing or attempting to circumvent our security measures</li>
                <li>Reverse engineering, decompiling, or extracting our source code</li>
                <li>Creating fake accounts or impersonating others</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </div>
          </section>

          <section id="email-compliance">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Compliance and Anti-Spam</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">You must comply with all applicable email marketing laws, including but not limited to:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>CAN-SPAM Act (United States)</li>
                <li>GDPR (European Union)</li>
                <li>CASL (Canada)</li>
                <li>Other local anti-spam and privacy regulations</li>
              </ul>
              <p className="mt-3 text-gray-600">
                You are solely responsible for ensuring your email campaigns comply with all applicable laws and obtaining proper consent from recipients.
              </p>
            </div>
          </section>

          <section id="intellectual-property">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Intellectual Property Rights</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">SlideIn's Rights</h3>
                <p className="text-gray-600">
                  SlideIn and its content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Your Content</h3>
                <p className="text-gray-600">
                  You retain ownership of any content you create or upload to SlideIn. By using our service, you grant us a limited, non-exclusive license to process, store, and transmit your content solely for the purpose of providing our services to you.
                </p>
              </div>
            </div>
          </section>

          <section id="third-party-services">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">SlideIn integrates with third-party services including:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Google Gmail API</li>
                <li>Microsoft Outlook API</li>
                <li>AI/ML service providers</li>
                <li>Analytics and tracking services</li>
              </ul>
              <p className="mt-3 text-gray-600">
                Your use of these integrated services is subject to their respective terms of service and privacy policies. We are not responsible for the practices or policies of third-party services.
              </p>
            </div>
          </section>

          <section id="privacy">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy and Data Protection</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-gray-600">
                Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our <a href="/privacy-policy" className="text-pink-600 hover:underline">Privacy Policy</a>, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.
              </p>
            </div>
          </section>

          <section id="service-availability">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Availability and Modifications</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Service Availability</h3>
                <p className="text-gray-600">
                  We strive to provide reliable service but cannot guarantee 100% uptime. We may experience maintenance periods, technical issues, or service interruptions. We are not liable for any damages resulting from service unavailability.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Service Modifications</h3>
                <p className="text-gray-600">
                  We reserve the right to modify, suspend, or discontinue any aspect of our service at any time, with or without notice. We may also impose limits on certain features or restrict access to parts of the service.
                </p>
              </div>
            </div>
          </section>

          <section id="termination">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Termination</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Termination by You</h3>
                <p className="text-gray-600">
                  You may terminate your account at any time by contacting our support team or using the account deletion feature in your settings. Upon termination, your access to the service will cease, and your data will be deleted according to our data retention policy.
                </p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Termination by Us</h3>
                <p className="text-gray-600 mb-3">We may terminate or suspend your account immediately, without prior notice, if you:</p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in prohibited activities</li>
                  <li>Fail to pay applicable fees</li>
                  <li>Engage in activity that could harm our service or other users</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="disclaimers">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Disclaimers and Warranties</h2>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">
                SlideIn is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind. We disclaim all warranties, whether express or implied, including but not limited to:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
                <li>Accuracy, reliability, or completeness of AI-generated content</li>
                <li>Uninterrupted or error-free service</li>
                <li>Security of data transmission</li>
              </ul>
              <p className="mt-3 text-gray-600 font-medium">
                You use our service at your own risk and are responsible for reviewing all AI-generated content before sending.
              </p>
            </div>
          </section>

          <section id="limitation-liability">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">
                To the maximum extent permitted by law, SlideIn shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Data loss or corruption</li>
                <li>Service interruptions</li>
                <li>Damages resulting from AI-generated content</li>
                <li>Third-party actions or breaches</li>
              </ul>
              <p className="mt-3 text-gray-600 font-medium">
                Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          <section id="indemnification">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Indemnification</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-gray-600">
                You agree to indemnify, defend, and hold harmless SlideIn and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from your use of the service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </div>
          </section>

          <section id="governing-law">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Governing Law</h2>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-gray-600">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where SlideIn is operated, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.
              </p>
            </div>
          </section>

          <section id="changes">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-gray-600">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes by email or through our service. Your continued use of SlideIn after changes take effect constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the service.
              </p>
            </div>
          </section>

          <section id="contact">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-gray-600 mb-4">For questions about these Terms of Service, please contact:</p>
              <div className="space-y-2">
                <a href="mailto:krishivkhatri2409@gmail.com" className="block text-pink-600 hover:text-pink-700">
                  Krishiv Khatri (krishivkhatri2409@gmail.com)
                </a>
                <a href="mailto:aditya.jain2702@gmail.com" className="block text-pink-600 hover:text-pink-700">
                  Aditya Jain (aditya.jain2702@gmail.com)
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SlideIn. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 