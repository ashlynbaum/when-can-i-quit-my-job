import Link from "next/link";

export default function AboutPage() {
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
          Who made this?
        </h1>
        
        <p className="mt-6 text-xl text-slate-600">
          Hi, I'm Ashlyn.
        </p>

        <div className="mt-12 space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8">
            <p className="text-slate-600 leading-relaxed">
              I started my career in New Zealand, where I accidentally fell in with people who had a very suspicious lifestyle: they'd do contract work to pay the bills, then spend the rest of their time on social enterprises and impact missions—optimizing for meaning instead of LinkedIn titles.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              That led me to found a social enterprise helping charities de-risk funding. It was deeply purposeful work. It was also financially... let's say non-robust.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Eventually, I realized something uncomfortable but important: <strong>caring about society doesn't mean you can ignore your own financial future.</strong>
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              These days, I work as a product manager and find a lot of purpose and joy designing and building digital experiences. But that early experience shaped how I think about the relationship between money, work, and meaning.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8">
            <h2 className="text-xl font-semibold text-slate-900">The recalibration</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              My husband and I moved to the US, and I've been working a great job solving real problems for real people. It's interesting, challenging, and I'm grateful for it. It just isn't the only thing I want my life optimized around.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              After having a baby, I started thinking a lot about time, energy, family, and who I want to be around. I opened "just one" spreadsheet to figure out: <strong>when could we reduce income? When could we stop optimizing purely for comp? When could we take a year to travel Europe? When could we live overseas and spend more time with family and in nature?</strong>
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              That spreadsheet got wildly out of hand. And here we are.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8">
            <h2 className="text-xl font-semibold text-slate-900">The thing about happiness</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              I went down a rabbit hole reading about what actually makes people happy. Turns out, once your basic needs are covered, more money doesn't do much. What helps is <strong>strong social connections and a sense of purpose</strong>.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              But you can't prioritize those things when you're stressed about survival. Money isn't the goal—but it does buy you options, time, and flexibility to invest in what matters.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              So there's this sweet spot — enough financial security to stop optimizing and start living. This calculator helps you find that spot.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-8">
            <h2 className="text-xl font-semibold text-slate-900">Why I built this</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              I built this for my own family planning, then figured others might find it useful too. I'm still employed (and grateful for my job). I'm just trying to make the math around not needing to a little more honest.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              It's free, there are no ads, and I'm not selling your data. I'm just a person who wanted to answer a question.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              If you want to connect or see what else I'm working on, find me on{" "}
              <a
                href="https://www.linkedin.com/in/ashlynbaum/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2 transition hover:text-emerald-700 hover:decoration-emerald-400"
              >
                LinkedIn
              </a>
              {" "}or check out{" "}
              <a
                href="https://ashlyn.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2 transition hover:text-emerald-700 hover:decoration-emerald-400"
              >
                ashlyn.app
              </a>
              .
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Questions? Feedback? Ideas?
            </p>
            <p className="mt-1 text-sm text-slate-500">
              I'd love to hear from you.
            </p>
          </div>

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
