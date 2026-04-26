import { useState } from 'react';
import { Send } from 'lucide-react';
import type { ApiError } from '../../api/client';
import { createRaffleEntry, type RaffleEntry } from '../../api/raffle';

function errorToText(err: unknown) {
  const e = err as Partial<ApiError> & { ticketNumber?: string };
  if (e?.status === 409 && e.ticketNumber) return `У тебя уже есть билет ${e.ticketNumber}`;
  if (e?.status === 409) return 'У тебя уже есть билет (VK или Telegram уже использованы).';
  if (e?.status === 400) return 'Проверь поля: имя и хотя бы VK или Telegram.';
  if (e?.status === 0) return 'Backend недоступен. Попробуй позже.';
  return 'Ошибка. Попробуй ещё раз.';
}

export default function RaffleForm({
  onCreated
}: {
  onCreated: (entry: RaffleEntry) => void;
}) {
  const [name, setName] = useState('');
  const [vk, setVk] = useState('');
  const [telegram, setTelegram] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const entry = await createRaffleEntry({ name, vk, telegram });
      onCreated(entry);
    } catch (e) {
      setError(errorToText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel form">
      <input placeholder="Твоё имя" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="VK (ссылка или ник)" value={vk} onChange={(e) => setVk(e.target.value)} />
      <input placeholder="Telegram (ник)" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <button className="button button-lime" onClick={submit} disabled={loading || !name.trim()}>
        {loading ? 'Генерируем билет…' : <><Send size={16} /> Получить билет</>}
      </button>
    </div>
  );
}

