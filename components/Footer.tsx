"use client";

import { useState } from "react";
import Link from "next/link";

export function Footer() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <>
      {/* Share Your Story Section */}
      <section className="relative border-t border-slate-200/40 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50/80 overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-20 right-10 h-40 w-40 rounded-full bg-white/30 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-10 left-16 h-36 w-36 rounded-full bg-white/25 blur-2xl" aria-hidden="true" />
        
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <div className="relative inline-block w-fit mb-5">
              <div
                className="absolute inset-[-7px] z-[1] rounded-full"
                style={{
                  backgroundImage: `conic-gradient(from 180deg at 50% 50%, #ebf6f2 0deg, #e7f3e0 18.3deg, #e5eff8 118.8deg, #fef1d8 176.4deg, #f7f4fa 237.6deg, #f7dbe5 295.2deg, #ebf6f2 360deg)`,
                  opacity: 0.8,
                  filter: "blur(5px)",
                  transform: "translateZ(0)",
                  WebkitTransform: "translateZ(0)"
                }}
              />
              <span className="relative z-[2] inline-block rounded-full border-2 border-white/90 bg-[#f7f7f799] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
                Your Journey
              </span>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Share Your Story
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-700">
              Did this calculator help you figure out your future? I'd love to hear what you're planning 
              to do with your time once you hit coast or quit.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-xl space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
            
            <div>
              <textarea
                placeholder="Tell me your story..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none"
              />
            </div>
            
            <div className="flex items-start gap-3">
              <p className="text-xs leading-relaxed text-slate-600">
                By submitting, you agree to our{" "}
                <Link href="/privacy" className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 transition hover:text-emerald-800 hover:decoration-emerald-400">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-slate-800 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
            
            {status === "success" && (
              <div className="rounded-xl border-2 border-emerald-200/60 bg-emerald-50/70 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-sm font-medium text-emerald-800">
                  Thanks for sharing! I'll read your story soon.
                </p>
              </div>
            )}
            
            {status === "error" && (
              <div className="rounded-xl border-2 border-red-200/60 bg-red-50/70 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-sm font-medium text-red-800">
                  {errorMessage || "Oops, something went wrong. Please try again."}
                </p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* About/Mission Section */}
      <section className="relative border-t border-slate-200/40 bg-gradient-to-br from-[#e7f2ed] via-[#eeebf1] to-[#bed6ea] overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" aria-hidden="true" />
        <div className="absolute bottom-16 right-16 h-40 w-40 rounded-full bg-white/30 blur-3xl" aria-hidden="true" />
        
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <div className="inline-block rounded-full border-2 border-white/60 bg-white/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur-sm mb-5">
            Plot Twist
          </div>
          
          <h3 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            You don't need to wait<br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              for retirement to live
            </span>
          </h3>
          
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-700">
            This calculator shows you when money stops being the reason you can't make a change. 
            But here's the real secret: meaningful relationships, creative projects, and time with people you love? 
            Those don't require financial independence.
          </p>
          
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg"
            >
              Start Planning Your Exit
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          {/* 3-column layout */}
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                Calculator
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/" className="text-sm text-slate-300 hover:text-white transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-slate-300 hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-sm text-slate-300 hover:text-white transition">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/why" className="text-sm text-slate-300 hover:text-white transition">
                    Why This Matters
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-slate-300 hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-slate-300 hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
              <div className="mt-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  This calculator is for educational purposes only—not financial advice. 
                  Consult a qualified financial advisor before making major decisions.
                </p>
              </div>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                Connect
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a 
                    href="mailto:hey@ashlyn.app" 
                    className="text-sm text-slate-300 hover:text-white transition"
                  >
                    hey@ashlyn.app
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="mt-10 border-t border-slate-700 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} When Can I Quit My Job. Made by{" "}
              <a
                href="https://ashlyn.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                ashlyn.app
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
