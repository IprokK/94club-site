import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Gift, Heart, Mail, Medal, Rocket, Send, Sparkles } from 'lucide-react';
import type { ApiError } from '../api/client';
import { listEvents } from '../api/events';
import Logo94 from '../components/Logo94';
import { AccentStripes, Tag } from '../components/UI';

function activitiesWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return 'активностей';
  if (m10 === 1) return 'активность';
  if (m10 >= 2 && m10 <= 4) return 'активности';
  return 'активностей';
}

export default function HomePage() {
  const [eventsTotal, setEventsTotal] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listEvents({ page: 1, limit: 1, q: '' })
      .then((res) => {
        if (!active) return;
        setEventsTotal(res.total);
      })
      .catch((_e: ApiError) => {
        if (!active) return;
        setEventsTotal(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const activitiesLine = useMemo(() => {
    if (eventsTotal === null) return { n: '—', t: 'активностей' };
    return { n: String(eventsTotal), t: activitiesWord(eventsTotal) };
  }, [eventsTotal]);

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
                { k: 'members', n: '100+', t: 'участников мероприятий' },
                { k: 'activities', n: activitiesLine.n, t: activitiesLine.t },
                { k: 'emotions', n: '∞', t: 'эмоций' }
              ].map((s) => (
                <div key={s.k} className="home-mag-stat">
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
          <div className="panel raffle-poster">
            <div className="raffle-poster-deco" aria-hidden />
            <div className="raffle-poster-hero">
              <div className="raffle-poster-copy">
                <div className="tag-row">
                  <span className="tag tag-raffle-kicker"><Gift size={14} /> raffle</span>
                  <Tag color="red">4 места</Tag>
                  <Tag color="white">билет • мерч • призы</Tag>
                </div>
                <div className="raffle-poster-title-row">
                  <h2 className="raffle-poster-title">
                    Розыгрыш <span>94 club</span>
                  </h2>
                  <Heart className="raffle-poster-heart" strokeWidth={1.4} size={48} aria-hidden />
                </div>
                <p className="raffle-poster-desc">
                  Оставь заявку, получи номер билета и участвуй в розыгрыше. Один билет на человека (VK или Telegram).
                </p>
                <div className="raffle-poster-actions">
                  <Link className="button button-lime" to="/raffle">Получить билет</Link>
                  <Link className="button button-outline-pink" to="/raffle/draw">Розыгрыш (админ)</Link>
                </div>
              </div>
              <div className="raffle-poster-logo" aria-hidden>
                <Logo94 />
              </div>
            </div>

            <div className="raffle-poster-prizes">
              {[
                {
                  step: 1 as const,
                  placeLabel: '1 место',
                  title: 'Билет',
                  sub: 'Билет на выезд в Ягодное',
                  img: '/assets/raffle-ticket.png',
                  Icon: Medal
                },
                {
                  step: 2 as const,
                  placeLabel: '2 место',
                  title: 'Футболка',
                  sub: 'Фирменная футболка 94 Club',
                  img: '/assets/raffle-tshirt.png',
                  Icon: Medal
                },
                {
                  step: 3 as const,
                  placeLabel: '3 место',
                  title: 'Брелок',
                  sub: 'Стильный брелок 94 Club',
                  img: '/assets/raffle-keychain.png',
                  Icon: Medal
                },
                {
                  step: 4 as const,
                  placeLabel: '4 место',
                  title: 'Стикеры',
                  sub: 'Набор фирменных стикеров',
                  img: '/assets/raffle-stickers.png',
                  Icon: Gift
                }
              ].map((p) => {
                const Icon = p.Icon;
                return (
                  <article key={p.step} className={`raffle-prize-card raffle-prize-card--${p.step}`}>
                    <header className="raffle-prize-card-hd">
                      <Icon className="raffle-prize-card-ico" size={18} strokeWidth={1.6} aria-hidden />
                      <span className="raffle-prize-card-place">{p.placeLabel}</span>
                    </header>
                    <h3 className="raffle-prize-card-title">{p.title}</h3>
                    <div className="raffle-prize-card-img">
                      <img src={p.img} alt="" loading="lazy" />
                    </div>
                    <p className="raffle-prize-card-foot">{p.sub}</p>
                  </article>
                );
              })}
            </div>

            <div className="raffle-poster-foot">
              <p className="raffle-poster-note">
                <span className="raffle-poster-note-mark" aria-hidden>!</span>
                Розыгрыш проводится среди всех получивших номер билета. Следи за новостями в наших соцсетях!
              </p>
              <div className="raffle-poster-social">
                <a
                  className="raffle-social raffle-social--vk"
                  href="https://vk.com/itmo94club"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg className="raffle-social-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.409 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.562c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.256 4.03 7.808 4.03 7.208c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.406.44-.406h2.744c.373 0 .508.203.508.644v3.168c0 .373.17.508.271.508.22 0 .407-.135.813-.542 1.254-1.405 2.15-3.574 2.15-3.574.119-.254.305-.491.745-.491h1.744c.525 0 .644.27.525.644-.22 1.288-2.35 3.86-2.35 3.86-.203.254-.28.406 0 .712.203.254.864.78 1.32 1.254.83.847 1.47 1.556 1.64 2.05.17.49-.102.745-.576.745z"
                    />
                  </svg>
                  <span>VKontakte</span>
                </a>
                <a
                  className="raffle-social raffle-social--tg"
                  href="https://t.me/itmo94club"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg className="raffle-social-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                    />
                  </svg>
                  <span>Telegram</span>
                </a>
              </div>
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
