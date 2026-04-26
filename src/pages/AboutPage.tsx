import { Link } from 'react-router-dom';
import { CalendarDays, Camera, HeartHandshake, Sparkles, Users } from 'lucide-react';
import Logo94 from '../components/Logo94';
import { AccentStripes, SectionTitle, Tag } from '../components/UI';

export default function AboutPage() {
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / о клубе" a="94 Club —" b="это люди" />

        <div className="two-col">
          <div className="panel big-text">
            <div className="tag-row">
              <Tag><Users size={14} /> комьюнити</Tag>
              <Tag color="pink"><Sparkles size={14} /> эмоции</Tag>
              <Tag color="white"><HeartHandshake size={14} /> поддержка</Tag>
            </div>
            <p>
              94 Club — студенческое сообщество, которое собирает людей вокруг событий, совместных идей и живого общения.
              Мы делаем форматы, где легко познакомиться, почувствовать “своих” и выйти из режима «просто наблюдаю».
            </p>
            <blockquote>Мы создаём пространство, в которое хочется возвращаться — не “по расписанию”, а по ощущению.</blockquote>

            <div className="mini-grid">
              {[
                ['Комьюнити', 'неформальная и живая среда, где ценят уважение и открытость'],
                ['События', 'квесты, выезды, встречи и форматы под сезон и настроение'],
                ['Оргкоманда', 'можно быть не только гостем — мы растим организаторов'],
                ['Визуал', 'сильная айдентика и аккуратная типографика — часть атмосферы']
              ].map(([a, b]) => (
                <div className="mini-card" key={a}>
                  <b>{a}</b>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel brand-panel">
            <Logo94 />
            <p>
              Мы держим планку в деталях: афиши, фотоконтент, декор, музыка, динамика вечера — всё работает на одно ощущение.
              Хочется, чтобы каждый выходил с мыслью: «это было по‑настоящему».
            </p>
            <div className="accent-stripes"><i /><i /><i /></div>
          </div>
        </div>

        <div style={{ height: 22 }} />

        <div className="benefit-grid">
          {[
            { title: 'Для кого', text: 'Для тех, кто хочет быть внутри событий, а не “рядом”. Новички, активные, интроверты — всем найдётся роль.', icon: Users },
            { title: 'Что делаем', text: 'Собираем форматы под сезон: от камерных встреч до больших запусков и выездов. Важно, чтобы было живо.', icon: CalendarDays },
            { title: 'Галерея', text: 'Фотографии и материалы — не “для отчёта”, а для памяти. Мы сохраняем моменты и атмосферу.', icon: Camera },
            { title: 'Тон', text: 'Минимализм, чёрный фон, лайм и розовый. Строго, чисто, но с эмоцией.', icon: Sparkles }
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

        <div className="wide-cta">
          <div>
            <h3>Хочешь в 94 Club? <span>Начни с одного события.</span></h3>
            <p>
              Посмотри календарь, выбери формат и приходи. А если захочется быть в команде — мы подскажем, как подключиться.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="button button-dark" to="/events">Смотреть события</Link>
            <Link className="button button-outline-dark" to="/gallery">Галерея</Link>
          </div>
        </div>

        <div style={{ height: 18 }} />

        <div className="panel">
          <div className="tag-row">
            <Tag color="white">как попасть</Tag>
            <Tag>быстро</Tag>
            <Tag color="pink">аккуратно</Tag>
          </div>
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              <h3 style={{ marginTop: 0, textTransform: 'uppercase' }}>Путь новичка</h3>
              <p className="admin-muted" style={{ marginTop: 10 }}>
                1) Подпишись на анонсы. 2) Приди на первое событие. 3) Познакомься с людьми и выбери свой формат.
              </p>
              <p className="admin-muted" style={{ marginTop: 10 }}>
                Если хочешь в орг — просто скажи об этом. У нас есть задачи “на вход” и роли под разные навыки.
              </p>
            </div>
            <div>
              <h3 style={{ marginTop: 0, textTransform: 'uppercase' }}>Ссылки</h3>
              <div className="hero-actions" style={{ marginTop: 14 }}>
                <a className="button button-outline" href="https://vk.com/itmo94club" target="_blank" rel="noreferrer">VK</a>
                <a className="button button-outline" href="https://t.me/itmo94club" target="_blank" rel="noreferrer">Telegram</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
