import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { defaultEvents, EventItem } from '../data/content';
import { SectionTitle, Tag } from '../components/UI';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  useEffect(() => {
    const saved = localStorage.getItem('94club-events');
    if (saved) setEvents(JSON.parse(saved));
  }, []);
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / календарь" a="Наши" b="мероприятия" />
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
