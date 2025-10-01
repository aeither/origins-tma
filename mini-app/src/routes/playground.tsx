import { createFileRoute } from '@tanstack/react-router'
import { TonWalletConnection } from '../components/TonWalletConnection'

export const Route = createFileRoute('/playground')({
  component: PlaygroundApp,
})

function PlaygroundApp() {
  return <TonWalletConnection />
}