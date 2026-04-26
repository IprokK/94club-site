import { Send } from 'lucide-react';
import { SectionTitle } from '../components/UI';

export default function JoinPage() {
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / join" a="Присоединяйся" b="к нам" />
        <div className="two-col">
          <div className="cta-lime">
            <h3>Не жди особенного момента. <span>Создавай его вместе с нами.</span></h3>
            <p>Подписывайся на анонсы, приходи на мероприятия, участвуй в организации и становись частью 94 Club.</p>
            <div className="hero-actions"><a className="button button-dark" href="https://vk.com/itmo94club">VK сообщества</a><a className="button button-outline-dark" href="https://t.me/itmo94club">Telegram клуба</a></div>
          </div>
          <form className="panel form" onSubmit={(e) => { e.preventDefault(); alert('Демо-форма: подключи backend или Formspree/Telegram bot.'); }}>
            <input placeholder="Твоё имя" />
            <input placeholder="Telegram или VK" />
            <textarea placeholder="Почему тебе интересен 94 Club?" />
            <button className="button button-lime" type="submit"><Send size={16} /> Отправить заявку</button>
          </form>
        </div>
      </div>
    </main>
  );
}
