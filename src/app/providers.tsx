'use client';

// 创建一个临时的 SessionProvider 替代品
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 