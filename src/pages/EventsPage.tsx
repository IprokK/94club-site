import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { defaultEvents, EventItem } from '../data/content';
import type { ApiError } from '../api/client';
import { listEvents, toPublicEventStatus } from '../api/events';
import { SectionTitle, Tag } from '../components/UI';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listEvents({ page: 1, limit: 50, q: '' })
      .then((res) => {
        if (!active) return;
        const mapped: EventItem[] = res.items.map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          date: e.date,
          location: e.location,
          description: e.description,
          status: toPublicEventStatus(e.status),
          image: e.image
        }));
        setEvents(mapped);
      })
      .catch((e: ApiError) => {
        if (!active) return;
        // если backend недоступен — показываем демо
        setError(e?.status === 0 ? 'Backend недоступен' : 'Ошибка загрузки');
        setEvents(defaultEvents);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / календарь" a="Наши" b="мероприятия" />
        {loading && <div className="admin-alert admin-alert-ok" style={{ marginBottom: 14 }}>Загружаем…</div>}
        {error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 14 }}>{error}</div>}
        <div className="event-list">
          {events.map((event, idx) => (
            <article className="event-row" key={event.id}>
              <div className="event-num">{String(idx + 1).padStart(2, '0')}</div>
              <div className="event-body">
                <div className="tag-row"><Tag>{event.category}</Tag><Tag color="white">{event.status}</Tag></div>
                <h3>{event.title}</h3>
                <p className="event-meta">{event.date} • {event.location}</p>
                <p>{event.description}</p>
              </div>
              <div className="event-image"><img src={event.image} alt={event.title} /></div>
              <button className="round-link"><ArrowRight /></button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
