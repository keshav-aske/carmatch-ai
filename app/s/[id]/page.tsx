import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getShortlist } from '@/lib/store'
import ShortlistDashboard from '@/components/ShortlistDashboard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const record = await getShortlist(params.id)
  if (!record) return { title: 'Shortlist not found · CarMatch AI' }
  const top = record.response.results[0]
  return {
    title: `${top.car.make} ${top.car.model} & ${record.response.results.length - 1} more · CarMatch AI`,
    description: `Saved car shortlist for ${record.response.quiz_summary.budget} · top match ${top.car.make} ${top.car.model} (${top.match_percentage}%).`,
  }
}

export default async function SharedShortlistPage({
  params,
}: {
  params: { id: string }
}) {
  const record = await getShortlist(params.id)
  if (!record) notFound()

  return (
    <ShortlistDashboard
      data={record.response}
      mode="shared"
      createdAt={record.created_at}
    />
  )
}
