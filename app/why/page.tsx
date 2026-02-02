import Link from "next/link";

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-24">
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
          Why though?
        </h1>
        
        <p className="mt-6 text-xl text-slate-600">
          Because the point of money isn't to have more money. It's to stop worrying about money.
        </p>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900">What actually matters</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Decades of happiness research point to the same conclusion: once your basic needs are covered, more money doesn't do much. What actually helps? <strong>Strong relationships and meaningful work</strong>.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              But here's the catch — it's hard to prioritize those things when you're anxious about making rent or stressed about your job security. Money isn't the goal. It's the foundation that lets you focus on what matters.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Ever declined plans with friends because of a work deadline? Stayed in a draining job because you needed the income? Felt guilty taking a week off? That's what financial stress does. It narrows your options until "can I afford this?" becomes the first question about everything.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">The shift</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              This calculator helps you see when the question changes:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white/80 p-5">
                <p className="font-medium text-slate-500">Before:</p>
                <p className="mt-2 text-slate-900">"Can I afford to take time off?"</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-5">
                <p className="font-medium text-emerald-700">After:</p>
                <p className="mt-2 text-slate-900">"Do I want to take time off?"</p>
              </div>
            </div>
            <p className="mt-6 text-slate-600 leading-relaxed">
              That shift happens in stages. And each stage unlocks different choices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">The three milestones</h2>
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
                <h3 className="font-semibold text-emerald-800">1. Survive</h3>
                <p className="mt-2 text-emerald-700">
                  You have a year of expenses in accessible savings. One bad month won't wreck you. You can breathe.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 p-6">
                <h3 className="font-semibold text-blue-800">2. Coast</h3>
                <p className="mt-2 text-blue-700">
                  Your investments will grow to cover retirement on their own. You can shift to work you love—even if it pays less—without compromising your future.
                </p>
              </div>
              <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                <h3 className="font-semibold text-purple-800">3. Quit</h3>
                <p className="mt-2 text-purple-700">
                  Your portfolio supports your spending indefinitely. Work becomes optional. You choose what Tuesday looks like.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">Your freedom date</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Not "never work again" (unless you want that). More like: when can you take a year off? When can you go part-time? When can you switch to that job you'd love but pays less? When can you stop optimizing for comp and start optimizing for life?
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              That's what this calculator helps you figure out. Not a retirement date. A <strong>freedom date</strong>. The point where money stops being the reason you can't make a change.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
