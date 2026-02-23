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

function isSafeHttpUrl(link: string): boolean {
  // Reject obvious bad inputs early
  if (!link || /\s/.test(link)) {
    return false
  }

  try {
    const url = new URL(link)

    // Allow only http and https URLs
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false
    }

    // Require a valid hostname
    if (!url.hostname) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function renderTextWithLinks(text: string, linkClassName?: string): React.ReactNode {
  const { text: textOnly, links } = extractLinks(text)
  const safeLinks = links.filter(isSafeHttpUrl)
  
  return (
    <>
      <span>{textOnly}</span>
      {safeLinks.length > 0 && (
        <div className="mt-2 space-y-1">
          {safeLinks.map((link, index) => (
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
