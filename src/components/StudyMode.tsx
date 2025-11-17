import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FlashCard } from './FlashCard'
import { Flashcard } from '@/lib/types'
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'

interface StudyModeProps {
  cards: Flashcard[]
  onExit: () => void
}

export function StudyMode({ cards, onExit }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const progress = ((currentIndex + 1) / cards.length) * 100
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < cards.length - 1

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === ' ') {
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex])

  if (cards.length === 0) {
    return null
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Study Mode</h2>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onExit}>
            <X size={24} />
          </Button>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="py-8">
          <FlashCard
            question={currentCard.question}
            answer={currentCard.answer}
            onFlip={setIsFlipped}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="flex-1"
          >
            <ArrowLeft size={20} className="mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex-1"
          >
            Next
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Click card to flip • Use arrow keys to navigate</p>
        </div>
      </div>
    </div>
  )
}
