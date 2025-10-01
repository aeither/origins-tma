import { createFileRoute } from '@tanstack/react-router'
import { UpdateInvoicePage } from '../components/UpdateInvoicePage'

export const Route = createFileRoute('/update-invoice')({
  component: UpdateInvoicePage,
})
