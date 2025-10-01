import { createFileRoute } from '@tanstack/react-router'
import { QuizTakingPage } from '../components/QuizTakingPage'

export const Route = createFileRoute('/quiz/$quizId')({
  component: () => {
    const { quizId } = Route.useParams()
    return <QuizTakingPage quizId={quizId} />
  },
})