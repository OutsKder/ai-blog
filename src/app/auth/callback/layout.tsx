export default function CallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* 这里不包含 Navbar */}
      {children}
    </div>
  )
} 