import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface FlashCardProps {
  question: string
  answer: string
  onFlip?: (isFlipped: boolean) => void
}

export function FlashCard({ question, answer, onFlip }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    const newState = !isFlipped
    setIsFlipped(newState)
    onFlip?.(newState)
  }

  return (
    <div className="perspective-1000 w-full h-[400px] cursor-pointer" onClick={handleFlip}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex-1 flex items-center justify-center w-full">
            <p className="text-xl md:text-2xl font-medium text-center leading-relaxed">
              {question}
            </p>
          </div>
          <div className="text-xs text-muted-foreground tracking-wider">SKILLS NAVIGATOR</div>
        </Card>

        <Card 
          className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 shadow-lg hover:shadow-xl transition-shadow"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1 flex items-center justify-center w-full">
            <p className="text-lg md:text-xl text-center leading-relaxed">
              {answer}
            </p>
          </div>
          <div className="text-xs text-muted-foreground tracking-wider">SKILLS NAVIGATOR</div>
        </Card>
      </motion.div>
    </div>
  )
}
