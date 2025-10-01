import { createFileRoute } from '@tanstack/react-router'
import { HelloWorldPage } from '../components/HelloWorldPage'

export const Route = createFileRoute('/hello-world')({
  component: HelloWorldPage,
})