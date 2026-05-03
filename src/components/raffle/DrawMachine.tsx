import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { ApiError } from '../../api/client';
import { drawWinner, getRaffleWinners, type RaffleWinner } from '../../api/raffle';
import TicketCard from './TicketCard';
import { Tag } from '../UI';

const ORDER: (4 | 3 | 2 | 1)[] = [4, 3, 2, 1];

function placeLabel(p: 1 | 2 | 3 | 4) {
  return p === 1 ? '🥇 1 место' : p === 2 ? '🥈 2 место' : p === 3 ? '🥉 3 место' : '🎁 4 место';
}

function apiErrorToText(err: unknown) {
  const e = err as Partial<ApiError> & { error?: string };
  if (e?.status === 401) return 'Нужна авторизация админа (JWT).';
  if (e?.status === 403) return 'Нет прав (role != admin).';
  if (e?.status === 409) {
    if (e.error === 'NO_ELIGIBLE_ENTRIES') {
      return 'Нет участников с отмеченными обеими подписками (VK и Telegram). Проверь билеты в админке.';
    }
    if (e.error === 'PLACE_ALREADY_DRAWN') return 'Это место уже разыграно.';
    if (e.error === 'FIXED_DRAW_ENTRY_INELIGIBLE') {
      return 'Режим RAFFLE_FIXED_DRAW: билет из env недоступен (галочки или уже в победителях). Проверь entry id.';
    }
    if (e.error === 'NO_ENTRIES_LEFT') return 'Не осталось участников в пуле.';
    return 'Нельзя провести розыгрыш (место занято или нет подходящих билетов).';
  }
  return 'Ошибка розыгрыша.';
}

function randomTicket() {
  const n = Math.floor(Math.random() * 9999);
  return `#${String(n).padStart(4, '0')}`;
}

export default function DrawMachine() {
  const [winners, setWinners] = useState<RaffleWinner[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [slot, setSlot] = useState(randomTicket());
  const [current, setCurrent] = useState<RaffleWinner | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextPlace = useMemo(() => ORDER[stepIdx] || null, [stepIdx]);

  useEffect(() => {
    getRaffleWinners()
      .then((res) => {
        setWinners(res.winners);
        const drawnPlaces = new Set(res.winners.map((w) => w.place));
        const next = ORDER.findIndex((p) => !drawnPlaces.has(p));
        setStepIdx(next === -1 ? ORDER.length : next);
      })
      .catch(() => {});
  }, []);

  const startRoll = async () => {
    if (!nextPlace) return;
    setError(null);
    setCurrent(null);
    setRolling(true);

    const start = Date.now();
    const duration = 2200;
    const timer = window.setInterval(() => setSlot(randomTicket()), 60);

    try {
      // чуть подождём, чтобы слот “пожил”
      await new Promise((r) => setTimeout(r, 1400));
      const winner = await drawWinner(nextPlace);
      const left = Math.max(0, duration - (Date.now() - start));
      await new Promise((r) => setTimeout(r, left));
      window.clearInterval(timer);
      setRolling(false);
      setSlot(winner.entry.ticketNumber);
      setCurrent(winner);
      setWinners((prev) => [...prev.filter((w) => w.place !== winner.place), winner].sort((a, b) => a.place - b.place));
    } catch (e) {
      window.clearInterval(timer);
      setRolling(false);
      setError(apiErrorToText(e));
    }
  };

  const next = () => {
    setCurrent(null);
    setError(null);
    setStepIdx((i) => Math.min(ORDER.length, i + 1));
  };

  return (
    <div className="panel raffle-draw">
      <div className="admin-alert admin-alert-ok" style={{ marginBottom: 14, textTransform: 'none', letterSpacing: 'normal' }}>
        В розыгрыше только билеты с двумя галочками в админке (подписка VK и Telegram). Сначала проверьте участников в разделе «Розыгрыш — проверка билетов».
      </div>

      <div className="raffle-draw-head">
        <div className="tag-row" style={{ marginBottom: 0 }}>
          <Tag>draw</Tag>
          <Tag color="pink">поэтапно</Tag>
          <Tag color="white">4 → 3 → 2 → 1</Tag>
        </div>
        <div className="raffle-draw-meta">
          {nextPlace ? <b>{placeLabel(nextPlace)}</b> : <b style={{ color: 'var(--lime)' }}>Готово</b>}
        </div>
      </div>

      <div className="raffle-slot">
        <div className={`raffle-slot-num ${rolling ? 'rolling' : ''}`}>{slot}</div>
        <div className="raffle-slot-sub">слот-машина • замедление • выбор</div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {current && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="admin-alert admin-alert-ok">{placeLabel(current.place)} • победитель</div>
          <TicketCard entry={{ ticketNumber: current.entry.ticketNumber, name: current.entry.name }} />
          <div className="admin-actions-row">
            {stepIdx < ORDER.length - 1 ? (
              <button className="button button-lime" onClick={next}>Далее</button>
            ) : (
              <button className="button button-outline" onClick={next}>Завершить</button>
            )}
          </div>
        </motion.div>
      )}

      {!current && (
        <div className="admin-actions-row">
          <button className="button button-pink" onClick={startRoll} disabled={!nextPlace || rolling}>
            {rolling ? 'Крутим…' : 'Начать розыгрыш'}
          </button>
        </div>
      )}

      <div className="raffle-winners">
        <h3 style={{ margin: '10px 0 0', textTransform: 'uppercase' }}>Победители</h3>
        <div className="raffle-winners-grid">
          {[1, 2, 3, 4].map((p) => {
            const w = winners.find((x) => x.place === p);
            return (
              <div key={p} className="raffle-winner-card">
                <b>{placeLabel(p as 1 | 2 | 3 | 4)}</b>
                <span>{w ? `${w.entry.ticketNumber} • ${w.entry.name}` : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

