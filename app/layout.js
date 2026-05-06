import './globals.css';

export const metadata = {
  title: 'Blumen Nolte – Strauß Konfigurator',
  description: '3D Blumenstrauß-Konfigurator für Blumen Nolte',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
