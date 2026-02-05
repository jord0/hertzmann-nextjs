import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Susan Herzig and Paul Hertzmann\'s vintage photography collection and expertise.',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>About Us</h1>
      
      <div style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          Susan Herzig and Paul Hertzmann specialize in 20th-century vintage photography including modernism, 
          f.64, photojournalism, the Photo-Secession, post-World War II innovations, as well as 19th century 
          American landscape photography and unusual or exceptional photographic albums.
        </p>
        
        <p style={{ marginBottom: '1.5rem' }}>
          Our specialization extends to portraits of American artists, including "ex-pats" who lived and worked 
          abroad and artists who visited or emigrated to the United States.
        </p>
        
        <p style={{ marginBottom: '1.5rem' }}>
          With more than 50 years of experience buying and selling vintage photographs, we are pleased to share 
          our expertise with museums, private collectors, and colleagues. Our knowledge of the art market, our 
          connoisseurship, and extensive research enable us to offer photographs of quality, rarity, and importance.
        </p>
        
        <p>
          Many photographs available for sale are not posted on this website. Please contact us for additional 
          photographs. Prices are listed for photographs below $10,000; contact us for prices not posted.
        </p>
      </div>
    </div>
  );
}