import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { cn } from "@/lib/utils"
// highlight.js CSS is loaded via global layout or here
import "highlight.js/styles/github-dark.css" // Assuming dark theme compatibility, or can choose another

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
