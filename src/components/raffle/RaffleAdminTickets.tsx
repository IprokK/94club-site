import { useEffect, useState } from 'react';
import { Search, Ticket } from 'lucide-react';
import type { ApiError } from '../../api/client';
import {
  getRaffleStats,
  listRaffleEntriesAdmin,
  patchRaffleEntry,
  type RaffleEntryAdmin
} from '../../api/raffle';

type Draft = { vk: boolean; tg: boolean; note: string };

export default function RaffleAdminTickets() {
  const [items, setItems] = useState<RaffleEntryAdmin[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(8);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ entries: number; eligible: number } | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchList = async (p: number, query: string) => {
    setError(null);
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        listRaffleEntriesAdmin({ page: p, limit, q: query }),
        getRaffleStats().catch(() => null)
      ]);
      setItems(res.items);
      setTotal(res.total);
      if (st) setStats({ entries: st.entries, eligible: st.eligible });
    } catch (e) {
      setError((e as ApiError)?.status === 401 ? 'Нужна авторизация.' : 'Не удалось загрузить билеты.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const m: Record<number, Draft> = { ...drafts };
    for (const it of items) {
      if (m[it.id] === undefined) {
        m[it.id] = { vk: it.conditionVkOk, tg: it.conditionTgOk, note: it.verifiedNote ?? '' };
      }
    }
    setDrafts(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const saveRow = async (id: number) => {
    const d = drafts[id];
    if (!d) return;
    setSavingId(id);
    setError(null);
    try {
      const updated = await patchRaffleEntry(id, {
        conditionVkOk: d.vk,
        conditionTgOk: d.tg,
        verifiedNote: d.note.trim() || null
      });
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      const st = await getRaffleStats().catch(() => null);
      if (st) setStats({ entries: st.entries, eligible: st.eligible });
    } catch (e) {
      setError('Не удалось сохранить. Проверь сессию.');
    } finally {
      setSavingId(null);
    }
  };

  const onSearch = () => {
    if (page === 1) {
      void fetchList(1, q);
    } else {
      setPage(1);
    }
  };

  return (
    <section className="panel" style={{ gridColumn: '1 / -1' }}>
      <h3>
        <Ticket size={18} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: 8 }} />
        Розыгрыш — проверка билетов
      </h3>
      <p className="admin-muted" style={{ marginBottom: 14 }}>
        Отметьте подписку в VK и в Telegram после ручной проверки. В розыгрыше участвуют только билеты с{' '}
        <b>обеими</b> галочками. Внизу — заметка (например, ссылка на скриншот).
      </p>
      {stats && (
        <p className="admin-mini" style={{ marginBottom: 12 }}>
          Всего билетов: <b>{stats.entries}</b> • готовы к розыгрышу (оба условия): <b>{stats.eligible}</b>
        </p>
      )}

      <div className="admin-toolbar">
        <div className="search">
          <input
            placeholder="Поиск: ФИО, VK, Telegram, номер билета…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <div className="actions">
          <button className="button button-outline" type="button" onClick={onSearch}>
            <Search size={16} /> Найти
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {loading ? (
        <p className="admin-muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="admin-muted">Нет билетов.</p>
      ) : (
        <>
          {items.map((it) => {
            const d = drafts[it.id] ?? { vk: it.conditionVkOk, tg: it.conditionTgOk, note: it.verifiedNote ?? '' };
            return (
              <div className="admin-row" key={it.id} style={{ display: 'block' }}>
                <div className="admin-mini" style={{ marginBottom: 8 }}>
                  <b>{it.ticketNumber}</b>
                  {' • '}
                  {new Date(it.createdAt).toLocaleString('ru-RU')}
                </div>
                <p style={{ margin: '0 0 6px', fontWeight: 800 }}>{it.name}</p>
                <p className="admin-muted" style={{ margin: '0 0 4px', fontSize: 13 }}>
                  VK: {it.vk}
                </p>
                <p className="admin-muted" style={{ margin: '0 0 12px', fontSize: 13 }}>
                  Telegram: {it.telegram}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={d.vk}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [it.id]: { ...d, vk: e.target.checked }
                        }))
                      }
                    />
                    <span className="admin-mini">Подписка VK</span>
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={d.tg}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [it.id]: { ...d, tg: e.target.checked }
                        }))
                      }
                    />
                    <span className="admin-mini">Подписка Telegram</span>
                  </label>
                  <button
                    className="button button-lime"
                    type="button"
                    disabled={savingId === it.id}
                    onClick={() => saveRow(it.id)}
                  >
                    {savingId === it.id ? 'Сохраняем…' : 'Сохранить'}
                  </button>
                </div>
                <input
                  placeholder="Заметка (опционально)"
                  value={d.note}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [it.id]: { ...d, note: e.target.value }
                    }))
                  }
                  style={{ width: '100%' }}
                />
              </div>
            );
          })}
          <div className="admin-pager">
            <span className="admin-mini">
              билетов: <b>{total}</b> • стр. <b>{page}</b> / {pages}
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="button button-outline" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Назад
              </button>
              <button
                className="button button-outline"
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
              >
                Дальше
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
