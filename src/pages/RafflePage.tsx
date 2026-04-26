import { useState } from 'react';
import { Download, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RaffleEntry } from '../api/raffle';
import { SectionTitle, Tag } from '../components/UI';
import RaffleForm from '../components/raffle/RaffleForm';
import TicketCard from '../components/raffle/TicketCard';
import { saveTicketImage } from '../components/raffle/saveTicket';

export default function RafflePage() {
  const [entry, setEntry] = useState<RaffleEntry | null>(null);

  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / raffle" a="Получи" b="свой билет" />

        <div className="two-col">
          <section className="panel big-text">
            <div className="tag-row">
              <Tag><Ticket size={14} /> билет</Tag>
              <Tag color="pink">4 места</Tag>
              <Tag color="white">один шанс</Tag>
            </div>
            <p>Условия простые:</p>
            <div className="mini-grid">
              {[
                ['VK', 'подписка на сообщество 94 Club'],
                ['Telegram', 'подписка на канал/чат клуба'],
                ['Форма', 'заполни данные, чтобы получить номер билета'],
                ['1 билет', 'по VK или Telegram — чтобы было честно']
              ].map(([a, b]) => (
                <div className="mini-card" key={a}>
                  <b>{a}</b>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="raffle-side">
            {!entry ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <RaffleForm onCreated={(e) => setEntry(e)} />
              </motion.div>
            ) : (
              <div className="raffle-result">
                <TicketCard entry={entry} />
                <div className="admin-actions-row">
                  <button className="button button-outline" onClick={() => setEntry(null)}>Новый билет</button>
                  <button className="button button-pink" onClick={() => saveTicketImage(entry)}>
                    <Download size={16} /> Сохранить билет
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

