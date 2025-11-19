import './globals.css';

export const metadata = {
  title: 'DB Toolkit - Modern Database Management',
  description: 'A modern, cross-platform desktop database management application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
