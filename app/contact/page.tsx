import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Susan Herzig and Paul Hertzmann about vintage photography inquiries.',
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Contact Us</h1>
      
      <div style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
        <p style={{ marginBottom: '2rem' }}>
          We welcome inquiries about our collection. Please feel free to contact us regarding:
        </p>
        
        <ul style={{ marginBottom: '2rem', marginLeft: '2rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Purchasing photographs</li>
          <li style={{ marginBottom: '0.5rem' }}>Selling your collection</li>
          <li style={{ marginBottom: '0.5rem' }}>Research inquiries</li>
          <li style={{ marginBottom: '0.5rem' }}>Appraisals</li>
        </ul>
        
        <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Email:</strong> <a href="mailto:hertzmann@hertzmann.com" style={{ color: '#0066cc' }}>hertzmann@hertzmann.com</a>
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Phone:</strong> [Add your phone number]
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Hours:</strong> By appointment
          </p>
        </div>
      </div>
    </div>
  );
}