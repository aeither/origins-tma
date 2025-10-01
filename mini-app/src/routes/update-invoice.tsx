import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/update-invoice')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/update-invoice"!</div>
}
