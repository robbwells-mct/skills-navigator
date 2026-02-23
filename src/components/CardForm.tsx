import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question" className="text-xs font-semibold text-blue-600">QUESTION</Label>
          <Textarea
            id="question"
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px] resize-none bg-white border-blue-200 focus:border-blue-400 text-sm font-medium text-gray-800"
            required
          />
        </div>
        
        <Separator className="bg-blue-200" />
        
        <div className="space-y-2">
          <Label htmlFor="answer" className="text-xs font-semibold text-blue-600">ANSWER</Label>
          <Textarea
            id="answer"
            placeholder="Enter the answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[100px] resize-none bg-white border-blue-200 focus:border-blue-400 text-sm text-gray-700"
            required
          />
        </div>
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
