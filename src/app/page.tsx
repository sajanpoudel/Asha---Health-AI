import dynamic from 'next/dynamic'

const HealthAssistant = dynamic(
  () => import('@/components/pages/HealthAssistant'),
  { ssr: false }
)

export default function Home() {
  return (
    <main>
      <HealthAssistant />
    </main>
  )
}