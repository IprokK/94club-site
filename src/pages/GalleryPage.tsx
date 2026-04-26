import { useEffect, useState } from 'react';
import { defaultGallery, GalleryItem } from '../data/content';
import { SectionTitle } from '../components/UI';
import type { ApiError } from '../api/client';
import { listGallery } from '../api/gallery';

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>(defaultGallery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listGallery({ page: 1, limit: 60, q: '' })
      .then((res) => {
        if (!active) return;
        const mapped: GalleryItem[] = res.items.map((g) => ({
          id: g.id,
          title: g.title,
          tag: g.tag,
          image: g.image
        }));
        setGallery(mapped);
      })
      .catch((e: ApiError) => {
        if (!active) return;
        setError(e?.status === 0 ? 'Backend недоступен' : 'Ошибка загрузки');
        setGallery(defaultGallery);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / галерея" a="Галерея" b="настроения" />
        {loading && <div className="admin-alert admin-alert-ok" style={{ marginBottom: 14 }}>Загружаем…</div>}
        {error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 14 }}>{error}</div>}
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
