export const metadata = { title: 'BaitulMarifah TV' };

export default function TvLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: '#0A0F1E', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
