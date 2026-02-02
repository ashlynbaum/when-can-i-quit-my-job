import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="mx-auto max-w-2xl px-6 pt-16 pb-24">
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
          How it works
        </h1>
        
        <p className="mt-6 text-xl text-slate-600">
          This calculator helps you model different financial futures and see when you reach key milestones.
        </p>

        <div className="mt-12 space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8">
            <h2 className="text-xl font-semibold text-slate-900">Enter your basics</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Start with your current financial situation: savings, income, expenses, and goals. The calculator uses this as your baseline.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8">
            <h2 className="text-xl font-semibold text-slate-900">Model scenarios</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Create different scenarios: take a sabbatical, reduce income, increase savings. See how each choice affects your timeline.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8">
            <h2 className="text-xl font-semibold text-slate-900">See your milestones</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              The calculator shows when you hit key thresholds: enough to survive, coast to retirement, and full financial independence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8">
            <h2 className="text-xl font-semibold text-slate-900">Compare paths</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Look at different scenarios side-by-side. Understand the tradeoffs between time, money, and freedom.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
            <p className="text-lg font-medium text-slate-900">Ready to plan your future?</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-slate-800 hover:to-slate-700"
            >
              Start calculating
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
