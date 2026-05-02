import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { ApiError } from '../../api/client';
import { createRaffleEntry, type RaffleEntry } from '../../api/raffle';

function errorToText(err: unknown) {
  const e = err as Partial<ApiError> & { ticketNumber?: string };
  if (e?.status === 409 && e.ticketNumber && e.error === 'DUPLICATE_NAME') {
    return `Это ФИО уже занято другим участником (билет ${e.ticketNumber}). Укажи ФИО как в документе; если это ты — проверь VK и Telegram.`;
  }
  if (e?.status === 409 && e.ticketNumber) return `Уже есть билет ${e.ticketNumber} по этим данным.`;
  if (e?.status === 409 && e.error === 'NO_FREE_TICKET_NUMBERS') {
    return 'Свободных номеров билетов не осталось. Напиши организаторам.';
  }
  if (e?.status === 409) return 'Такой участник уже зарегистрирован.';
  if (e?.error === 'NEED_VK_PROFILE_URL') {
    return 'Укажи ссылку на свою страницу VK: vk.com/ник или vk.com/id…. Ссылки из раздела «Сообщения» (im) без id или общая лента не подходят.';
  }
  if (e?.error === 'NEED_TELEGRAM_HANDLE') {
    return 'Укажи свой Telegram: @ник или ссылка именно на профиль. Для t.me/s/… нужно полное имя после /s/.';
  }
  if (e?.error === 'NEED_NAME_VK_TELEGRAM' || e?.status === 400) {
    return 'Укажи ФИО, VK и Telegram.';
  }
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
  /** Защита от двойного клика до первого ре-рендера (loading ещё false в двух вызовах подряд). */
  const submitLockRef = useRef(false);

  const submit = async () => {
    if (submitLockRef.current) return;
    setError(null);
    if (!name.trim() || !vk.trim() || !telegram.trim()) {
      setError('Заполни ФИО, VK и Telegram.');
      return;
    }
    submitLockRef.current = true;
    setLoading(true);
    try {
      const entry = await createRaffleEntry({ name: name.trim(), vk: vk.trim(), telegram: telegram.trim() });
      onCreated(entry);
    } catch (e) {
      setError(errorToText(e));
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="panel form">
      <input placeholder="ФИО (как в документе)" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="VK (ник или ссылка)" value={vk} onChange={(e) => setVk(e.target.value)} />
      <input placeholder="Telegram (ник)" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <button
        className="button button-lime"
        onClick={submit}
        disabled={loading || !name.trim() || !vk.trim() || !telegram.trim()}
      >
        {loading ? 'Генерируем билет…' : <><Send size={16} /> Получить билет</>}
      </button>
    </div>
  );
}
