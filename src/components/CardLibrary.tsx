import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Flashcard } from '@/lib/types'
import { CardForm } from './CardForm'
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
                    <p>{card.answer}</p>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <CardForm
              initialCard={editingCard}
              onSubmit={handleEdit}
              onCancel={() => setEditingCard(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCardId} onOpenChange={() => setDeletingCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flashcard? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
