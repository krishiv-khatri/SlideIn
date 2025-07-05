import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Generator - SlideIn',
  description: 'Generate and send emails with AI assistance',
};

export default function EmailGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 