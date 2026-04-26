import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Flame, Rocket, Sparkles, Users } from 'lucide-react';
import Logo94 from '../components/Logo94';
import { AccentStripes, ButtonLink, SectionTitle, Tag } from '../components/UI';

const benefits = [
  { title: 'Люди', text: 'Находи своих — тех, с кем совпадают интересы, темп и энергия.', icon: Users },
  { title: 'События', text: 'Квесты, встречи, выезды, онлайн-форматы и клубные спецпроекты.', icon: CalendarDays },
  { title: 'Рост', text: 'Пробуй себя в организации, коммуникации и создании идей.', icon: Rocket },
  { title: 'Вдохновение', text: 'Эмоции, истории и впечатления, которые остаются надолго.', icon: Sparkles }
];

export default function HomePage() {
  return (
    <main>
      <section className="hero section-pad">
        <div className="container hero-grid">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="tag-row"><Tag>сообщество</Tag><Tag color="pink">рост</Tag><Tag color="white">вдохновение</Tag></div>
            <h1>Мероприятия, <span>которые объединяют</span></h1>
            <p className="hero-text">94 Club — это не просто клуб. Это люди, события и атмосфера, в которой хочется быть собой, пробовать новое и создавать истории вместе.</p>
            <div className="hero-actions">
              <Link className="button button-lime" to="/join">Вступить в клуб</Link>
              <Link className="button button-outline" to="/events">Смотреть события</Link>
            </div>
            <div className="stats-grid">
              {[['100+', 'участников'], ['5+', 'форматов'], ['∞', 'знакомств'], ['94', 'уровень вайба']].map(([n, t]) => <div className="stat-card" key={t}><b>{n}</b><span>{t}</span></div>)}
            </div>
          </motion.div>
          <motion.div className="hero-card" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="poster-card">
              <Logo94 />
              <div className="poster-copy"><Tag>новые знакомства</Tag><Tag color="pink">новые возможности</Tag><h3>Это не клуб — <span>мы сообщество</span></h3><p>люди • события • вдохновение</p><AccentStripes /></div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="section-pad border-top">
        <div className="container">
          <SectionTitle kicker="94 клуб / кратко" a="Почему" b="это работает" />
          <div className="benefit-grid">
            {benefits.map((item) => { const Icon = item.icon; return <div className="benefit-card" key={item.title}><Icon /><h3>{item.title}</h3><p>{item.text}</p></div>; })}
          </div>
          <div className="wide-cta">
            <div><h3>Не жди особенного момента. <span>Создавай его вместе с нами.</span></h3><p>Приходи на мероприятия, участвуй в организации и становись частью 94 Club.</p></div>
            <ButtonLink href="/join">Присоединиться</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
