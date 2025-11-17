import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Flashcard } from '@/lib/types'

interface CardFormProps {
  onSubmit: (question: string, answer: string) => void
  onCancel: () => void
  initialCard?: Flashcard
}

export function CardForm({ onSubmit, onCancel, initialCard }: CardFormProps) {
  const [question, setQuestion] = useState(initialCard?.question || '')
  const [answer, setAnswer] = useState(initialCard?.answer || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim() && answer.trim()) {
      onSubmit(question.trim(), answer.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[100px] resize-none"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          placeholder="Enter the answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[100px] resize-none"
          required
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!question.trim() || !answer.trim()}>
          {initialCard ? 'Update Card' : 'Add Card'}
        </Button>
      </div>
    </form>
  )
}
