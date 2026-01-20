import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Changelog 发布系统',
  description: '产品更新日志',
  keywords: ['changelog', '更新日志', 'release notes'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
