import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Gift, Mail, Rocket, Send, Sparkles } from 'lucide-react';
import Logo94 from '../components/Logo94';
import { AccentStripes, Tag } from '../components/UI';

export default function HomePage() {
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
              <Link className="button button-lime" to="/#join">Вступить в клуб</Link>
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
          <div className="panel raffle-announce">
            <div className="raffle-announce-head">
              <div>
                <div className="tag-row">
                  <Tag><Gift size={14} /> raffle</Tag>
                  <Tag color="pink">4 места</Tag>
                  <Tag color="white">билет • мерч • призы</Tag>
                </div>
                <h3 className="raffle-title">Розыгрыш 94 Club</h3>
                <p className="admin-muted">Оставь заявку, получи номер билета и участвуй в розыгрыше. Один билет на человека (VK или Telegram).</p>
              </div>
              <div className="raffle-announce-actions">
                <Link className="button button-lime" to="/raffle">Получить билет</Link>
                <Link className="button button-outline" to="/raffle/draw">Розыгрыш (админ)</Link>
              </div>
            </div>

            <div className="raffle-prizes">
              {[
                { place: '🥇 1 место', title: 'Билет', img: '/assets/raffle-ticket.png' },
                { place: '🥈 2 место', title: 'Футболка', img: '/assets/raffle-tshirt.png' },
                { place: '🥉 3 место', title: 'Брелок', img: '/assets/raffle-keychain.png' },
                { place: '🎁 4 место', title: 'Стикеры', img: '/assets/raffle-stickers.png' }
              ].map((p) => (
                <div key={p.title} className="raffle-prize">
                  <div className="raffle-prize-meta">
                    <b>{p.place}</b>
                    <span>{p.title}</span>
                  </div>
                  <div className="raffle-prize-img">
                    <img src={p.img} alt={p.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* блок событий с главной убран; страница "Мероприятия" остаётся отдельной */}

      <section className="section-pad border-top">
        <div className="container home-mag-footer" id="join">
          <div className="cta-lime">
            <h3>Не жди особенного момента. <span>Создавай его вместе с нами.</span></h3>
            <p>Подписывайся на анонсы, приходи на мероприятия, участвуй в организации и становись частью 94 Club.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="https://vk.com/itmo94club" target="_blank" rel="noreferrer">VK сообщества</a>
              <a className="button button-outline-dark" href="https://t.me/itmo94club" target="_blank" rel="noreferrer">Telegram клуба</a>
            </div>
          </div>

          <form
            className="panel form"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Демо-форма: подключи backend или Formspree/Telegram bot.');
            }}
          >
            <input placeholder="Твоё имя" />
            <input placeholder="Telegram или VK" />
            <textarea placeholder="Почему тебе интересен 94 Club?" />
            <button className="button button-lime" type="submit"><Send size={16} /> Отправить заявку</button>
          </form>
        </div>
      </section>

      <section className="section-pad border-top">
        <div className="container">
          <div className="section-title">
            <p>94 клуб / collaboration</p>
            <h2>Для <span>партнёров</span></h2>
          </div>
          <div className="benefit-grid">
            {[
              { title: 'Коллаборации', text: 'Совместные мероприятия, спецпроекты, интеграции и партнёрские активности.', icon: Rocket },
              { title: 'Инфоподдержка', text: 'Визуально сильные анонсы, соцсети и вовлечение аудитории через формат клуба.', icon: Sparkles },
              { title: 'Контакт', text: 'Напиши нам — соберём коллаборацию под задачу и аудиторию.', icon: Mail }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="benefit-card" key={item.title}>
                  <Icon />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
