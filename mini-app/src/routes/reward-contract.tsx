import { createFileRoute } from '@tanstack/react-router'
import { RewardContractPage } from '../components/RewardContractPage'

export const Route = createFileRoute('/reward-contract')({
  component: RewardContractPage,
})