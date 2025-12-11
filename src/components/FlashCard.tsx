import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { renderTextWithLinks } from '@/lib/linkify'

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
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,103,192,0.25)] transition-all duration-300 border-2 border-blue-100/50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"></div>
          <div className="flex-1 flex items-center justify-center w-full">
            <p className="text-xl md:text-2xl font-semibold text-center leading-relaxed text-gray-800">
              {question}
            </p>
          </div>
          <div className="text-xs text-blue-600 font-semibold tracking-widest">SKILLS NAVIGATOR</div>
        </Card>

        <Card 
          className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,103,192,0.25)] transition-all duration-300 border-2 border-blue-400"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/80 via-blue-200 to-white/80"></div>
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="text-lg md:text-xl text-center leading-relaxed text-white font-medium">
              {renderTextWithLinks(answer, "text-white hover:text-blue-100 underline block break-all")}
            </div>
          </div>
          <div className="text-xs text-white/90 font-semibold tracking-widest">SKILLS NAVIGATOR</div>
        </Card>
      </motion.div>
    </div>
  )
}
