import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center px-6 py-24">
      <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
        404 · Shortlist not found
      </div>
      <h1 className="mt-5 text-4xl font-medium tracking-tight text-slate-100 sm:text-5xl">
        This link has expired
        <br />
        or was never valid.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-slate-400">
        Saved shortlists live on a serverless filesystem and may expire after long periods of
        inactivity. Take the quiz again — you&apos;ll be back to your top three in under a minute.
      </p>

      <Link
        href="/"
        className="button-primary group mt-10 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm"
      >
        Take the quiz
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
