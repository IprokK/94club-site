import Logo94 from '../components/Logo94';
import { SectionTitle } from '../components/UI';

export default function AboutPage() {
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / о нас" a="Не просто" b="мероприятия" />
        <div className="two-col">
          <div className="panel big-text">
            <p>94 Club — это студенческое сообщество, в котором важны люди, эмоции, взаимная поддержка и сильный визуальный стиль.</p>
            <blockquote>Мы создаём пространство, где хочется возвращаться.</blockquote>
            <div className="mini-grid">
              {[
                ['Комьюнити', 'неформальная и живая среда'],
                ['Организация', 'можно участвовать не только как гость'],
                ['Эмоции', 'каждое событие — это история'],
                ['Стиль', 'узнаваемая визуальная айдентика']
              ].map(([a,b]) => <div className="mini-card" key={a}><b>{a}</b><span>{b}</span></div>)}
            </div>
          </div>
          <div className="panel brand-panel">
            <Logo94 />
            <p>Сайт собран как основа под реальный многостраничный проект: живые фотографии, команда, анонсы, формы заявок и админ-панель.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
