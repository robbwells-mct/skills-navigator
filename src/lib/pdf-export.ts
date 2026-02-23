import jsPDF from 'jspdf'
import { Flashcard } from './types'

export function exportToPDF(cards: Flashcard[]) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Header with branding
  doc.setFillColor(0, 103, 192) // Microsoft blue
  doc.rect(0, 0, pageWidth, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Skills Ready', margin, 10)

  yPosition = 30

  // Title
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Flashcard Collection', margin, yPosition)
  
  yPosition += 10

  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  doc.text(`Generated: ${date}`, margin, yPosition)
  
  yPosition += 5

  // Total cards
  doc.text(`Total Cards: ${cards.length}`, margin, yPosition)
  
  yPosition += 15

  // Cards
  cards.forEach((card, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = margin
    }

    // Card number with blue background
    doc.setFillColor(221, 241, 255) // Light blue
    doc.roundedRect(margin, yPosition - 5, contentWidth, 10, 2, 2, 'F')
    doc.setTextColor(0, 103, 192)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Card ${index + 1}`, margin + 3, yPosition)
    
    yPosition += 12

    // Question
    doc.setTextColor(0, 103, 192)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('QUESTION:', margin + 5, yPosition)
    
    yPosition += 6

    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    const questionLines = doc.splitTextToSize(card.question, contentWidth - 10)
    doc.text(questionLines, margin + 5, yPosition)
    yPosition += questionLines.length * 5 + 5

    // Answer
    doc.setTextColor(0, 103, 192)
    doc.setFont('helvetica', 'bold')
    doc.text('ANSWER:', margin + 5, yPosition)
    
    yPosition += 6

    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    
    // Extract URLs from the answer text
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = card.answer.match(urlRegex) || []
    
    // Remove URLs from the answer text to display separately
    let answerTextOnly = card.answer
    urls.forEach(url => {
      // Remove URL and any separator characters (|, -, etc.) around it
      answerTextOnly = answerTextOnly.replace(new RegExp(`\\s*[|\\-]?\\s*${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[|\\-]?\\s*`, 'g'), ' ')
    })
    answerTextOnly = answerTextOnly.trim()
    
    // Display answer text without URLs
    const answerLines = doc.splitTextToSize(answerTextOnly, contentWidth - 10)
    answerLines.forEach((line: string, lineIndex: number) => {
      doc.text(line, margin + 5, yPosition + lineIndex * 5)
    })
    yPosition += answerLines.length * 5
    
    // Display URLs on separate lines below the answer
    if (urls.length > 0) {
      yPosition += 3 // Small gap before URLs
      urls.forEach((url) => {
        doc.setTextColor(0, 103, 192) // Blue color for links
        doc.textWithLink(url, margin + 5, yPosition, { url: url })
        yPosition += 5
      })
      doc.setTextColor(0, 0, 0) // Reset color
    }
    
    yPosition += 10

    // Separator line
    if (index < cards.length - 1) {
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
    }
  })

  // Add footer to all pages
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Footer background
    doc.setFillColor(0, 103, 192)
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F')
    
    // Footer text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Skills Ready - Master any subject with flashcards', margin, pageHeight - 5)
    
    // Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 5)
  }

  // Save the PDF
  doc.save(`skills-ready-flashcards-${Date.now()}.pdf`)
}
