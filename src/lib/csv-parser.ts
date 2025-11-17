import { Flashcard } from './types'

export function parseCSV(csvText: string): Flashcard[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  const cards: Flashcard[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(',').map(part => part.trim().replace(/^["']|["']$/g, ''))
    
    if (parts.length >= 2 && parts[0] && parts[1]) {
      cards.push({
        id: `card-${Date.now()}-${i}`,
        question: parts[0],
        answer: parts[1],
        createdAt: Date.now()
      })
    }
  }

  return cards
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
