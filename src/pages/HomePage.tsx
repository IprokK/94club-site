import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';
import Logo94 from '../components/Logo94';
import { defaultEvents } from '../data/content';
import { AccentStripes, Tag } from '../components/UI';

export default function HomePage() {
  const topEvents = defaultEvents.slice(0, 3);
  return (
    <main>
      <section className="section-pad">
        <div className="container home-mag-grid">
          <motion.section className="home-mag-hero" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="tag-row">
              <Tag>94 клуб</Tag>
              <Tag color="white">сообщество</Tag>
              <Tag color="pink">рост</Tag>
              <Tag color="lime">вдохновение</Tag>
            </div>
            <h1>Наши <span>события</span></h1>
            <p className="hero-text">
              Мы создаём события, которые вдохновляют, объединяют и дают новые возможности.
            </p>
            <div className="hero-actions">
              <Link className="button button-lime" to="/join">Вступить в клуб</Link>
              <Link className="button button-outline" to="/events">Смотреть события</Link>
            </div>
            <AccentStripes />
          </motion.section>

          <motion.aside className="home-mag-aside panel" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="home-mag-logo">
              <Logo94 />
            </div>
            <div className="home-mag-stats">
              {[
                { n: '100+', t: 'участников' },
                { n: '5', t: 'активностей' },
                { n: '∞', t: 'эмоций' }
              ].map((s) => (
                <div key={s.t} className="home-mag-stat">
                  <b>{s.n}</b>
                  <span>{s.t}</span>
                </div>
              ))}
            </div>
            <div className="home-mag-note">
              <Tag><CalendarDays size={14} /> календарь</Tag>
              <Tag color="pink"><Sparkles size={14} /> атмосфера</Tag>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="section-pad border-top">
        <div className="container">
          <div className="home-mag-list">
            {topEvents.map((event, idx) => (
              <motion.article
                className="home-mag-row"
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
              >
                <div className="home-mag-num">{idx + 1}</div>
                <div className="home-mag-body">
                  <div className="tag-row">
                    <Tag>{event.category}</Tag>
                    <Tag color="white">{event.status}</Tag>
                  </div>
                  <h2 className="home-mag-title">{event.title}</h2>
                  <p className="home-mag-meta">{event.date} • {event.location}</p>
                  <p className="home-mag-desc">{event.description}</p>
                  <div className="home-mag-actions">
                    <Link className="button button-outline" to="/events">
                      Подробнее <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
                <div className="home-mag-media">
                  <img src={event.image} alt={event.title} />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-top">
        <div className="container home-mag-footer">
          <div className="panel home-mag-cta">
            <h3>Хочешь <span>с нами?</span></h3>
            <p className="admin-muted">Следи за анонсами и приходи на события — мы всегда рады новым людям.</p>
            <div className="home-mag-cta-actions">
              <Link className="button button-lime" to="/join">Присоединиться</Link>
              <Link className="button button-outline" to="/gallery">Смотреть галерею</Link>
            </div>
          </div>
          <div className="panel home-mag-qr">
            <h3>Контакты</h3>
            <div className="home-mag-qr-grid">
              <div className="home-mag-qr-card">
                <b>VK</b>
                <span>vk.com/…</span>
              </div>
              <div className="home-mag-qr-card">
                <b>Telegram</b>
                <span>t.me/…</span>
              </div>
            </div>
            <div className="home-mag-quote">
              <Tag color="pink">94 Club</Tag>
              <p>Это твоя <b>история</b></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
