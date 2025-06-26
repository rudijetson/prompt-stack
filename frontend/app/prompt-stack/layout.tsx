/**
 * Prompt-Stack Demo Layout
 * 
 * This layout wraps all the Prompt-Stack demo and example pages.
 * The AuthProvider is now provided at the root level in app/layout.tsx
 * so authentication works consistently across the entire app.
 * 
 * When developers start their own project, they can simply delete
 * the entire prompt-stack folder to remove all demo content.
 */

export default function PromptStackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}