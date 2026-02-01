import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to calculator
        </Link>

        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Privacy Policy
        </h1>
        
        <p className="mt-6 text-sm text-slate-500">
          Last updated: January 31, 2026
        </p>

        <div className="prose prose-slate mt-12 max-w-none">
          <h2>Your data stays yours</h2>
          <p>
            All calculations happen in your browser. Your financial information never leaves your device. We don't store, track, or have access to your numbers.
          </p>

          <h2>Local storage</h2>
          <p>
            We use your browser's local storage to save your calculations between sessions. This data stays on your device and is never transmitted to our servers.
          </p>

          <h2>Contact form</h2>
          <p>
            If you submit the contact form, we collect:
          </p>
          <ul>
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your message</li>
          </ul>
          <p>
            We use this information solely to respond to your inquiry. We don't sell, share, or use this data for marketing purposes.
          </p>

          <h2>Analytics</h2>
          <p>
            We do not use analytics or tracking tools. We don't collect information about how you use the calculator.
          </p>

          <h2>Third-party services</h2>
          <p>
            We use Resend for email delivery when you submit the contact form. Resend processes your email and message according to their privacy policy.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we make changes to this privacy policy, we'll update the date at the top of this page.
          </p>

          <h2>Questions?</h2>
          <p>
            Email us at <a href="mailto:hey@ashlyn.app" className="text-emerald-600 hover:text-emerald-700">hey@ashlyn.app</a>
          </p>
        </div>
      </div>
    </div>
  );
}
