import Chat from '@/components/chat'

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  return <Chat channel={name} />
}
