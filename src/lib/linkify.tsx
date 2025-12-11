import React from 'react'

interface LinkifyResult {
  text: string
  links: string[]
}

export function extractLinks(text: string): LinkifyResult {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const links = text.match(urlRegex) || []
  
  // Remove URLs and separator characters from text
  let textOnly = text
  links.forEach(link => {
    textOnly = textOnly.replace(new RegExp(`\\s*[|\\-]?\\s*${link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[|\\-]?\\s*`, 'g'), ' ')
  })
  
  return {
    text: textOnly.trim(),
    links
  }
}

export function renderTextWithLinks(text: string, linkClassName?: string): React.ReactNode {
  const { text: textOnly, links } = extractLinks(text)
  
  return (
    <>
      <span>{textOnly}</span>
      {links.length > 0 && (
        <div className="mt-2 space-y-1">
          {links.map((link, index) => (
            <a
              key={index}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName || "text-blue-600 hover:text-blue-800 underline block break-all"}
              onClick={(e) => e.stopPropagation()}
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
