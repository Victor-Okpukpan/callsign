import CallsignApp from '@/components/CallsignApp'

interface PageProps {
  searchParams: Promise<{ data?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  return <CallsignApp initialData={params.data} />
}
