import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LIS Teacher View - Lighthouse International School SIS',
  description: '등대국제학교 교사용 뷰 화면 UI & 디자인 시스템 독립 패키지',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-background text-on-background min-h-screen">
        {children}
      </body>
    </html>
  );
}
