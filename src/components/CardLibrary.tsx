import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Flashcard } from '@/lib/types'
import { CardForm } from './CardForm'
import { renderTextWithLinks } from '@/lib/linkify'
import { Pencil, Trash } from '@phosphor-icons/react'

interface CardLibraryProps {
  cards: Flashcard[]
  onEdit: (id: string, question: string, answer: string) => void
  onDelete: (id: string) => void
}

export function CardLibrary({ cards, onEdit, onDelete }: CardLibraryProps) {
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)

  const handleEdit = (question: string, answer: string) => {
    if (editingCard) {
      onEdit(editingCard.id, question, answer)
      setEditingCard(null)
    }
  }

  const handleDelete = () => {
    if (deletingCardId) {
      onDelete(deletingCardId)
      setDeletingCardId(null)
    }
  }

  return (
    <>
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Question</p>
                    <p className="font-medium">{card.question}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Answer</p>
                    <div>{renderTextWithLinks(card.answer)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCard(card)}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingCardId(card.id)}
                  >
                    <Trash size={18} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Current Card</h3>
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-2">QUESTION</p>
                      <p className="text-sm font-medium text-gray-800">{editingCard.question}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-2">ANSWER</p>
                      <p className="text-sm text-gray-700">{editingCard.answer}</p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Edit Content</h3>
                <CardForm
                  initialCard={editingCard}
                  onSubmit={handleEdit}
                  onCancel={() => setEditingCard(null)}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCardId} onOpenChange={() => setDeletingCardId(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm shadow-2xl border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Card</AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Are you sure you want to delete this flashcard? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700 px-6">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
