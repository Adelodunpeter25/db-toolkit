import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'DB Toolkit - Modern Database Management',
  description: 'A modern, cross-platform desktop database management application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
