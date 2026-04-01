// src/app/layout.tsx
import '@fontsource-variable/noto-sans-myanmar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  );
}
