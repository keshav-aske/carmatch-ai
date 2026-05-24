'use client'

import { useState } from 'react'
import Landing from '@/components/Landing'
import QuizWizard from '@/components/QuizWizard'
import ShortlistDashboard from '@/components/ShortlistDashboard'
import type { MatchResponse, QuizAnswers } from '@/lib/types'

type View = 'landing' | 'quiz' | 'results'

export default function HomePage() {
  const [view, setView] = useState<View>('landing')
  const [results, setResults] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleQuizComplete(answers: QuizAnswers) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Request failed (${res.status})`)
      }
      const data: MatchResponse = await res.json()
      setResults(data)
      setView('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResults(null)
    setView('landing')
    setError(null)
  }

  function retake() {
    setResults(null)
    setView('quiz')
  }

  return (
    <main className="min-h-screen w-full">
      {view === 'landing' && <Landing onStart={() => setView('quiz')} />}
      {view === 'quiz' && (
        <QuizWizard
          onComplete={handleQuizComplete}
          onBack={() => setView('landing')}
          loading={loading}
          error={error}
        />
      )}
      {view === 'results' && results && (
        <ShortlistDashboard data={results} onRetake={retake} onHome={reset} />
      )}
    </main>
  )
}
