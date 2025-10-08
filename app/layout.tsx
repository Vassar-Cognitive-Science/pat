import './global.css';
import './print.css';

export const metadata = {
  title: 'PAT - Philosophical Artificial Thinker',
  description: 'A chatbot focused on philosophical discussions about cognitive science',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
          {children}
      </body>
    </html>
  );
}
