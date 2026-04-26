import { useEffect, useState } from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { defaultEvents, defaultGallery, EventItem, GalleryItem } from '../data/content';
import { SectionTitle, Tag } from '../components/UI';

function readEvents(): EventItem[] {
  const saved = localStorage.getItem('94club-events');
  return saved ? JSON.parse(saved) : defaultEvents;
}
function readGallery(): GalleryItem[] {
  const saved = localStorage.getItem('94club-gallery');
  return saved ? JSON.parse(saved) : defaultGallery;
}

export default function AdminPage() {
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [gallery, setGallery] = useState<GalleryItem[]>(defaultGallery);
  const [eventForm, setEventForm] = useState({ title: '', category: 'Анонс', date: '', location: '', description: '', image: '/assets/events-poster.png' });
  const [galleryForm, setGalleryForm] = useState({ title: '', tag: 'Новый раздел', image: '/assets/brandbook.png' });

  useEffect(() => {
    setEvents(readEvents());
    setGallery(readGallery());
  }, []);
  useEffect(() => localStorage.setItem('94club-events', JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem('94club-gallery', JSON.stringify(gallery)), [gallery]);

  const addEvent = () => {
    if (!eventForm.title.trim()) return;
    setEvents([{ id: Date.now(), title: eventForm.title, category: eventForm.category, date: eventForm.date || 'Скоро', location: eventForm.location || '94 Club', status: 'Скоро', image: eventForm.image, description: eventForm.description || 'Описание появится здесь.' }, ...events]);
    setEventForm({ title: '', category: 'Анонс', date: '', location: '', description: '', image: '/assets/events-poster.png' });
  };

  const addGallery = () => {
    if (!galleryForm.title.trim()) return;
    setGallery([{ id: Date.now(), title: galleryForm.title, tag: galleryForm.tag, image: galleryForm.image }, ...gallery]);
    setGalleryForm({ title: '', tag: 'Новый раздел', image: '/assets/brandbook.png' });
  };

  const resetAll = () => {
    setEvents(defaultEvents); setGallery(defaultGallery); localStorage.removeItem('94club-events'); localStorage.removeItem('94club-gallery');
  };

  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / admin" a="Админ" b="панель" />
        <div className="admin-stats">
          <div><b>{events.length}</b><span>событий</span></div>
          <div><b>{gallery.length}</b><span>элементов галереи</span></div>
          <div><b>local</b><span>хранение</span></div>
          <div><b>UI</b><span>готово к backend</span></div>
        </div>
        <div className="admin-grid">
          <section className="panel form">
            <h3><Plus /> Добавить событие</h3>
            <input placeholder="Название" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <input placeholder="Категория" value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })} />
            <input placeholder="Дата" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
            <input placeholder="Локация" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
            <input placeholder="Путь к картинке" value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} />
            <textarea placeholder="Описание" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
            <button className="button button-lime" onClick={addEvent}>Добавить</button>
          </section>
          <section className="panel form">
            <h3><Camera /> Добавить в галерею</h3>
            <input placeholder="Название" value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} />
            <input placeholder="Тег" value={galleryForm.tag} onChange={(e) => setGalleryForm({ ...galleryForm, tag: e.target.value })} />
            <input placeholder="Путь к картинке" value={galleryForm.image} onChange={(e) => setGalleryForm({ ...galleryForm, image: e.target.value })} />
            <button className="button button-pink" onClick={addGallery}>Добавить</button>
            <button className="button button-outline" onClick={resetAll}>Сбросить демо-данные</button>
          </section>
        </div>
        <div className="admin-content">
          <section className="panel">
            <h3>Управление событиями</h3>
            {events.map((event) => <div className="admin-row" key={event.id}><div><Tag>{event.category}</Tag><h4>{event.title}</h4><p>{event.date} • {event.location}</p></div><button onClick={() => setEvents(events.filter(e => e.id !== event.id))}><Trash2 /></button></div>)}
          </section>
          <section className="panel">
            <h3>Управление галереей</h3>
            {gallery.map((item) => <div className="admin-row" key={item.id}><div><Tag color="white">{item.tag}</Tag><h4>{item.title}</h4></div><button onClick={() => setGallery(gallery.filter(g => g.id !== item.id))}><Trash2 /></button></div>)}
          </section>
        </div>
      </div>
    </main>
  );
}
