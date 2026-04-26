import { useEffect, useState } from 'react';
import { defaultGallery, GalleryItem } from '../data/content';
import { SectionTitle } from '../components/UI';

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>(defaultGallery);
  useEffect(() => {
    const saved = localStorage.getItem('94club-gallery');
    if (saved) setGallery(JSON.parse(saved));
  }, []);
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / галерея" a="Галерея" b="настроения" />
        <div className="gallery-grid">
          {gallery.map((item) => (
            <article className="gallery-card" key={item.id}>
              <img src={item.image} alt={item.title} />
              <div><span>{item.tag}</span><h3>{item.title}</h3></div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
