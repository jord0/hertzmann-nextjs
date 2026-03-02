import AdminNav from './AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <AdminNav />
      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
