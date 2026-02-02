import Link from "next/link";

export default function WhyPage() {
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
          Why though?
        </h1>
        
        <p className="mt-6 text-xl text-slate-600">
          Because the point of money isn't to have more money. It's to stop worrying about money.
        </p>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900">The research is clear</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Harvard ran an 80+ year study tracking what actually makes people happy. The answer wasn't money, success, or achievements. It was <strong>relationships</strong>. People who stayed healthiest and happiest were the ones who prioritized connections with others.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              But here's the thing — it's hard to prioritize relationships when you're stressed about rent. Money matters up to a point. Once your basic needs are covered and you have some breathing room, more money doesn't really move the needle on happiness.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">The happiness ladder</h2>
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
                <h3 className="font-semibold text-emerald-800">1. Cover the basics</h3>
                <p className="mt-2 text-emerald-700">
                  Housing, food, healthcare. The stuff that keeps you alive and not panicking. This is where money genuinely helps.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 p-6">
                <h3 className="font-semibold text-blue-800">2. Buy yourself options</h3>
                <p className="mt-2 text-blue-700">
                  Enough saved that one bad month (or year) won't wreck you. Breathing room. The ability to say "no" to things that drain you.
                </p>
              </div>
              <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                <h3 className="font-semibold text-purple-800">3. Choose your life</h3>
                <p className="mt-2 text-purple-700">
                  Time for people you love. Work that feels meaningful. Rest that isn't "recovering from burnout." This is the actual goal.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900">So when can you quit?</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Not "never work again" quit (unless you want that). More like: when can you take a year off? When can you switch to a job you love that pays less? When can you go part-time? When can you stop optimizing and start living?
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              That's what this calculator helps you figure out. Not a retirement date. A <strong>freedom date</strong>.
            </p>
          </section>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 text-center">
            <p className="text-lg font-medium text-slate-900">Ready to find your number?</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-slate-800 hover:to-slate-700"
            >
              Do the math
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
