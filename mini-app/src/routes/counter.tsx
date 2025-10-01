import { createFileRoute } from '@tanstack/react-router'
import { CounterPage } from '../components/CounterPage'

export const Route = createFileRoute('/counter')({
  component: CounterPage,
})
