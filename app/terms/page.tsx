import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-24">
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
          Terms of Service
        </h1>
        
        <p className="mt-6 text-sm text-slate-500">
          Last updated: January 31, 2026
        </p>

        <div className="prose prose-slate mt-12 max-w-none">
          <h2>The basics</h2>
          <p>
            This calculator is provided for educational and informational purposes only. It is not financial advice.
          </p>

          <h2>Not financial advice</h2>
          <p>
            The calculations and projections provided by this tool are simplified models. They don't account for many real-world factors including:
          </p>
          <ul>
            <li>Market volatility</li>
            <li>Tax implications</li>
            <li>Unexpected expenses</li>
            <li>Changes in income</li>
            <li>Inflation variations</li>
            <li>Your personal circumstances</li>
          </ul>
          <p>
            Before making major financial decisions, consult with a qualified financial advisor who understands your complete situation.
          </p>

          <h2>Use at your own risk</h2>
          <p>
            We provide this tool "as is" without warranties of any kind. We're not responsible for any decisions you make based on the calculator's output.
          </p>

          <h2>No guarantees</h2>
          <p>
            Past performance doesn't guarantee future results. The calculator's projections are estimates, not predictions.
          </p>

          <h2>Your responsibility</h2>
          <p>
            You're responsible for the accuracy of the information you input and for how you interpret the results.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms. Continued use of the calculator means you accept any changes.
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
