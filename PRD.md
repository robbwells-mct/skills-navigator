# Planning Guide

A flashcard application that helps users learn any subject by creating, importing, and studying question-answer pairs with an intuitive card-flipping interface.

**Experience Qualities**: 
1. **Focused** - Minimizes distractions to help users concentrate on learning with clean, card-based interactions
2. **Effortless** - Makes importing and studying flashcards feel natural and uncomplicated
3. **Encouraging** - Provides positive reinforcement through smooth animations and progress tracking

**Complexity Level**: Light Application (multiple features with basic state)
  - Handles flashcard creation, CSV import, study mode with card flipping, and progress tracking across sessions

## Essential Features

### CSV Import
- **Functionality**: Parse and import CSV files where column A contains questions and column B contains answers
- **Purpose**: Allows users to quickly build flashcard decks from existing study materials
- **Trigger**: User clicks import button and selects a CSV file
- **Progression**: Click Import → File selector opens → User selects CSV → File parsed → Cards added to deck → Success notification shown
- **Success criteria**: CSV files are correctly parsed with column A as questions and column B as answers, handling various CSV formats

### Flashcard Creation
- **Functionality**: Manual form to add individual flashcards with question and answer fields
- **Purpose**: Enables custom flashcard creation without needing external files
- **Trigger**: User clicks "Add Card" button
- **Progression**: Click Add Card → Form appears → Enter question and answer → Click Save → Card added to deck → Form clears
- **Success criteria**: New cards persist across sessions and appear in study mode

### Study Mode
- **Functionality**: Interactive card flipping interface that shows question, reveals answer on click/tap
- **Purpose**: Core learning experience where users test their knowledge
- **Trigger**: User clicks "Study" button when cards exist
- **Progression**: Click Study → First card shows question side → Click to flip → Answer revealed → Navigate next/previous → Complete deck → Return to library
- **Success criteria**: Cards flip smoothly, navigation works intuitively, progress through deck is tracked

### Deck Management
- **Functionality**: View all flashcards in a list, edit or delete individual cards
- **Purpose**: Maintain and organize flashcard collection
- **Trigger**: User views library page
- **Progression**: View library → See all cards → Click edit icon → Modify content → Save changes OR Click delete → Confirm → Card removed
- **Success criteria**: All CRUD operations persist correctly using useKV

## Edge Case Handling
- **Empty State**: Show welcoming message with clear call-to-action when no cards exist
- **Invalid CSV**: Display helpful error message if CSV format is incorrect or file is unreadable
- **Single Card**: Study mode works correctly even with just one card in the deck
- **Duplicate Cards**: Allow duplicates but show count of total cards clearly
- **Large Decks**: Handle 100+ cards with smooth performance through virtualization if needed

## Design Direction
The design should feel focused and studious yet modern and approachable, like a digital study companion that's both serious about learning and pleasant to use - a minimal interface that lets content take center stage with purposeful animations that reinforce the card-flipping metaphor.

## Color Selection
Complementary (opposite colors) - Using a calming blue for learning focus paired with warm accents for interactive elements and success states to create visual interest while maintaining concentration.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 250)) - Represents knowledge, trust, and focus for primary actions
- **Secondary Colors**: Soft Gray-Blue (oklch(0.92 0.02 250)) for backgrounds, maintains cohesion with primary while staying subtle
- **Accent Color**: Warm Amber (oklch(0.70 0.15 70)) for active states, progress indicators, and success feedback - energetic without being distracting
- **Foreground/Background Pairings**:
  - Background (White oklch(0.99 0 0)): Dark text (oklch(0.20 0 0)) - Ratio 16.1:1 ✓
  - Card (Soft Gray-Blue oklch(0.97 0.01 250)): Dark text (oklch(0.20 0 0)) - Ratio 14.8:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text (oklch(0.99 0 0)) - Ratio 8.2:1 ✓
  - Secondary (Light Blue oklch(0.92 0.02 250)): Dark text (oklch(0.25 0 0)) - Ratio 12.5:1 ✓
  - Accent (Warm Amber oklch(0.70 0.15 70)): Dark text (oklch(0.20 0 0)) - Ratio 7.8:1 ✓
  - Muted (Light Gray oklch(0.95 0 0)): Medium Gray text (oklch(0.50 0 0)) - Ratio 5.2:1 ✓

## Font Selection
A clean, highly legible sans-serif that conveys clarity and professionalism while remaining friendly - Inter for its excellent readability at all sizes and modern character.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter SemiBold/32px/tight letter spacing (-0.02em)
  - H2 (Section Headers): Inter SemiBold/24px/normal letter spacing
  - H3 (Card Question): Inter Medium/20px/relaxed line height (1.6)
  - Body (Card Answer): Inter Regular/18px/relaxed line height (1.6)
  - Small (Metadata): Inter Regular/14px/normal line height (1.5)
  - Caption (Watermark): Inter Regular/12px/wide letter spacing (0.05em)

## Animations
Animations should reinforce the physical metaphor of flipping flashcards while keeping interactions snappy - purposeful 3D card flips that feel satisfying without slowing down study rhythm, with subtle micro-interactions for state changes.

- **Purposeful Meaning**: Card flip animations use 3D transforms to create realistic turning motion that makes the digital experience feel tangible and tactile
- **Hierarchy of Movement**: 
  - Primary: Card flip (300ms with perspective) - the hero interaction
  - Secondary: Card navigation slides (200ms) - smooth but quick
  - Tertiary: Button hover states (150ms) - responsive feedback
  - Ambient: Progress bar fills (400ms ease-out) - encouraging momentum

## Component Selection
- **Components**: 
  - Card for flashcard display with custom 3D flip styling
  - Button for primary actions (Study, Add Card, Import)
  - Input and Textarea for card creation form
  - Dialog for add/edit card forms
  - Alert for import errors and confirmations
  - Progress bar for study session tracking
  - Separator for visual organization
  - Badge for card count indicators
  - Scroll-area for large deck lists
  
- **Customizations**: 
  - Custom FlashCard component with 3D flip transform using preserve-3d
  - CSV file upload input with drag-and-drop styling
  - Study mode navigation with keyboard shortcuts (Space to flip, Arrow keys for navigation)
  
- **States**: 
  - Buttons: Prominent shadow on hover, slight scale on active, disabled state clearly muted
  - Cards: Subtle shadow at rest, elevated shadow on hover, flipped state shows answer with rotateY transform
  - Inputs: Border highlight on focus with accent color, error state with destructive color
  
- **Icon Selection**: 
  - Plus for add card action
  - Upload for CSV import
  - FlipHorizontal for flip card hint
  - ArrowLeft/ArrowRight for navigation
  - Pencil for edit
  - Trash for delete
  - CheckCircle for completion
  
- **Spacing**: 
  - Page padding: p-6 md:p-8
  - Card gap: gap-4
  - Button padding: px-6 py-3
  - Section spacing: space-y-6
  - Form field spacing: space-y-4
  
- **Mobile**: 
  - Stack layout vertically on mobile with full-width cards
  - Touch-friendly targets (min 44px)
  - Single column card list instead of grid
  - Simplified navigation with swipe gestures for card navigation
  - Bottom-fixed action buttons for easy thumb access
