import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  applicationName: 'Nexora Fit',
  title: {
    default: 'Nexora Fit',
    template: '%s | Nexora Fit',
  },
  description: 'Sua evolução, todos os dias.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
