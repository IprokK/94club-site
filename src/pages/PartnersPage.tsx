import { Mail, Rocket, Sparkles } from 'lucide-react';
import { SectionTitle } from '../components/UI';

const cards = [
  { title: 'Коллаборации', text: 'Совместные мероприятия, спецпроекты, интеграции и партнёрские активности.', icon: Rocket },
  { title: 'Инфоподдержка', text: 'Визуально сильные анонсы, соцсети и вовлечение аудитории через формат клуба.', icon: Sparkles },
  { title: 'Контакт', text: 'Можно добавить форму для заявок партнёров, медиакит и презентацию клуба.', icon: Mail }
];

export default function PartnersPage() {
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / collaboration" a="Для" b="партнёров" />
        <div className="benefit-grid">
          {cards.map((item) => { const Icon = item.icon; return <div className="benefit-card" key={item.title}><Icon /><h3>{item.title}</h3><p>{item.text}</p></div>; })}
        </div>
      </div>
    </main>
  );
}
