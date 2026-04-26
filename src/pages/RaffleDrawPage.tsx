import { SectionTitle } from '../components/UI';
import DrawMachine from '../components/raffle/DrawMachine';

export default function RaffleDrawPage() {
  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / raffle" a="Розыгрыш" b="призов" />
        <DrawMachine />
      </div>
    </main>
  );
}

