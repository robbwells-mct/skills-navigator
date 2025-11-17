import { useState, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Flashcard } from '@/lib/types'
import { parseCSV, readFileAsText } from '@/lib/csv-parser'
import { CardForm } from '@/components/CardForm'
import { CardLibrary } from '@/components/CardLibrary'
import { StudyMode } from '@/components/StudyMode'
import { Plus, Upload, BookOpen, Cards } from '@phosphor-icons/react'
import { toast } from 'sonner'

function App() {
  const [cards, setCards] = useKV<Flashcard[]>('flashcards', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isStudying, setIsStudying] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cardList = cards || []

  const handleAddCard = (question: string, answer: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      question,
      answer,
      createdAt: Date.now()
    }
    setCards((currentCards) => [...(currentCards || []), newCard])
    setIsAddDialogOpen(false)
    toast.success('Card added successfully!')
  }

  const handleEditCard = (id: string, question: string, answer: string) => {
    setCards((currentCards) =>
      (currentCards || []).map(card =>
        card.id === id ? { ...card, question, answer } : card
      )
    )
    toast.success('Card updated successfully!')
  }

  const handleDeleteCard = (id: string) => {
    setCards((currentCards) => (currentCards || []).filter(card => card.id !== id))
    toast.success('Card deleted successfully!')
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)

    try {
      const text = await readFileAsText(file)
      const importedCards = parseCSV(text)

      if (importedCards.length === 0) {
        setImportError('No valid cards found in CSV. Make sure column A has questions and column B has answers.')
        return
      }

      setCards((currentCards) => [...(currentCards || []), ...importedCards])
      toast.success(`Successfully imported ${importedCards.length} card${importedCards.length > 1 ? 's' : ''}!`)
    } catch (error) {
      setImportError('Failed to import CSV file. Please check the file format.')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleStartStudy = () => {
    if (cardList.length > 0) {
      setIsStudying(true)
    }
  }

  if (isStudying) {
    return <StudyMode cards={cardList} onExit={() => setIsStudying(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Skills Navigator</h1>
            <p className="text-muted-foreground mt-1">Master any subject with flashcards</p>
          </div>
          <Badge variant="secondary" className="text-base px-4 py-2">
            <Cards size={20} className="mr-2" />
            {cardList.length} {cardList.length === 1 ? 'Card' : 'Cards'}
          </Badge>
        </div>

        <Separator />

        {importError && (
          <Alert variant="destructive">
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
            <Plus size={20} className="mr-2" />
            Add Card
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} className="mr-2" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />

          <Button
            variant="default"
            size="lg"
            onClick={handleStartStudy}
            disabled={cardList.length === 0}
            className="ml-auto"
          >
            <BookOpen size={20} className="mr-2" />
            Study Now
          </Button>
        </div>

        {cardList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
              <Cards size={48} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">No flashcards yet</h3>
              <p className="text-muted-foreground max-w-md">
                Get started by adding your first card or importing a CSV file with your study materials
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
                <Plus size={20} className="mr-2" />
                Create Your First Card
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} className="mr-2" />
                Import CSV
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Flashcards</h2>
            <CardLibrary
              cards={cardList}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
          </DialogHeader>
          <CardForm
            onSubmit={handleAddCard}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App