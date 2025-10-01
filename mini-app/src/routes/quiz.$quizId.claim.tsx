import { createFileRoute } from '@tanstack/react-router'
import { QuizRewardClaimPage } from '../components/QuizRewardClaimPage'

export const Route = createFileRoute('/quiz/$quizId/claim')({
  component: () => {
    const { quizId } = Route.useParams()
    return <QuizRewardClaimPage quizId={quizId} />
  },
})