import { useEffect, useMemo, useState } from 'react';
import { Camera, ImagePlus, LogOut, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import type { ApiError } from '../api/client';
import { listEvents, createEvent, deleteEvent, updateEvent, type EventDto, type EventStatus } from '../api/events';
import { listGallery, createGallery, deleteGallery, updateGallery, type GalleryDto } from '../api/gallery';
import { getSiteSettings, updateSiteSettings, type SiteSettingsPublic } from '../api/settings';
import { listJoinRequests, type JoinRequestDto } from '../api/join';
import { uploadImage } from '../api/uploads';
import Modal from '../components/Modal';
import RaffleAdminTickets from '../components/raffle/RaffleAdminTickets';
import { SectionTitle, Tag } from '../components/UI';

const EVENT_STATUSES: { label: string; value: EventStatus }[] = [
  { label: 'Скоро', value: 'СКОРО' },
  { label: 'Прошло', value: 'ПРОШЛО' },
  { label: 'Черновик', value: 'ЧЕРНОВИК' }
];

function apiErrorToText(err: unknown) {
  const e = err as Partial<ApiError>;
  if (e?.status === 401) return 'Сессия истекла. Войди снова.';
  if (e?.error) return `Ошибка: ${e.error}${e.status ? ` (${e.status})` : ''}`;
  return 'Ошибка. Проверь backend и повтори.';
}

type ConfirmState =
  | null
  | { kind: 'event'; id: number; title: string }
  | { kind: 'gallery'; id: number; title: string };

export default function AdminPage() {
  const nav = useNavigate();

  // Events state
  const [events, setEvents] = useState<EventDto[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsLimit] = useState(8);
  const [eventsQ, setEventsQ] = useState('');
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Gallery state
  const [gallery, setGallery] = useState<GalleryDto[]>([]);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryLimit] = useState(9);
  const [galleryQ, setGalleryQ] = useState('');
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  // Modals + forms
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventEditId, setEventEditId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Анонс',
    date: 'Скоро',
    location: '94 Club',
    description: '',
    image: '',
    status: 'СКОРО' as EventStatus
  });
  const [eventFile, setEventFile] = useState<File | null>(null);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventFormError, setEventFormError] = useState<string | null>(null);

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryEditId, setGalleryEditId] = useState<number | null>(null);
  const [galleryForm, setGalleryForm] = useState({ title: '', tag: 'Новый раздел', image: '' });
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [gallerySaving, setGallerySaving] = useState(false);
  const [galleryFormError, setGalleryFormError] = useState<string | null>(null);

  const [calSettings, setCalSettings] = useState<SiteSettingsPublic>({ calendarLabel: 'календарь', calendarPath: '/events' });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [joinList, setJoinList] = useState<JoinRequestDto[]>([]);
  const [joinTotal, setJoinTotal] = useState(0);
  const [joinPage, setJoinPage] = useState(1);
  const [joinLimit] = useState(8);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const stats = useMemo(() => {
    return [
      { b: String(eventsTotal), s: 'событий' },
      { b: String(galleryTotal), s: 'элементов галереи' },
      { b: 'JWT', s: 'авторизация' },
      { b: 'DB', s: 'хранение' }
    ];
  }, [eventsTotal, galleryTotal]);

  const eventPreviewUrl = useMemo(() => {
    if (eventFile) return URL.createObjectURL(eventFile);
    return eventForm.image || '';
  }, [eventFile, eventForm.image]);

  const galleryPreviewUrl = useMemo(() => {
    if (galleryFile) return URL.createObjectURL(galleryFile);
    return galleryForm.image || '';
  }, [galleryFile, galleryForm.image]);

  useEffect(() => {
    return () => {
      if (eventFile) URL.revokeObjectURL(eventPreviewUrl);
      if (galleryFile) URL.revokeObjectURL(galleryPreviewUrl);
    };
  }, [eventFile, eventPreviewUrl, galleryFile, galleryPreviewUrl]);

  const loadEvents = async () => {
    setEventsError(null);
    setEventsLoading(true);
    try {
      const res = await listEvents({ page: eventsPage, limit: eventsLimit, q: eventsQ });
      setEvents(res.items);
      setEventsTotal(res.total);
    } catch (e) {
      const text = apiErrorToText(e);
      setEventsError(text);
      if ((e as ApiError)?.status === 401) nav('/admin/login', { replace: true });
    } finally {
      setEventsLoading(false);
    }
  };

  const loadGallery = async () => {
    setGalleryError(null);
    setGalleryLoading(true);
    try {
      const res = await listGallery({ page: galleryPage, limit: galleryLimit, q: galleryQ });
      setGallery(res.items);
      setGalleryTotal(res.total);
    } catch (e) {
      const text = apiErrorToText(e);
      setGalleryError(text);
      if ((e as ApiError)?.status === 401) nav('/admin/login', { replace: true });
    } finally {
      setGalleryLoading(false);
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const s = await getSiteSettings();
      setCalSettings(s);
    } catch {
      setToast({ kind: 'error', text: 'Не удалось загрузить настройки календаря' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadJoin = async () => {
    setJoinError(null);
    setJoinLoading(true);
    try {
      const res = await listJoinRequests({ page: joinPage, limit: joinLimit });
      setJoinList(res.items);
      setJoinTotal(res.total);
    } catch (e) {
      setJoinError(apiErrorToText(e));
      if ((e as ApiError)?.status === 401) nav('/admin/login', { replace: true });
    } finally {
      setJoinLoading(false);
    }
  };

  const saveCalendarSettings = async () => {
    setSettingsSaving(true);
    try {
      const s = await updateSiteSettings({
        calendarLabel: calSettings.calendarLabel.trim(),
        calendarPath: calSettings.calendarPath.trim()
      });
      setCalSettings(s);
      setToast({ kind: 'ok', text: 'Календарь на главной обновлён' });
    } catch (e) {
      setToast({ kind: 'error', text: apiErrorToText(e) });
      if ((e as ApiError)?.status === 401) nav('/admin/login', { replace: true });
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);
  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsPage]);
  useEffect(() => {
    loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryPage]);
  useEffect(() => {
    loadJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinPage]);

  const onLogout = () => {
    logout();
    nav('/admin/login', { replace: true });
  };

  const openCreateEvent = () => {
    setEventEditId(null);
    setEventForm({ title: '', category: 'Анонс', date: 'Скоро', location: '94 Club', description: '', image: '', status: 'СКОРО' });
    setEventFile(null);
    setEventFormError(null);
    setEventModalOpen(true);
  };

  const openEditEvent = (e: EventDto) => {
    setEventEditId(e.id);
    setEventForm({
      title: e.title,
      category: e.category,
      date: e.date,
      location: e.location,
      description: e.description,
      image: e.image,
      status: e.status
    });
    setEventFile(null);
    setEventFormError(null);
    setEventModalOpen(true);
  };

  const saveEvent = async () => {
    setEventFormError(null);
    setEventSaving(true);
    try {
      let image = eventForm.image;
      if (eventFile) {
        const up = await uploadImage(eventFile);
        image = up.url;
      }

      const payload = { ...eventForm, image: image || '/assets/events-poster.png' };
      if (eventEditId) await updateEvent(eventEditId, payload);
      else await createEvent(payload);

      setEventModalOpen(false);
      setToast({ kind: 'ok', text: eventEditId ? 'Событие обновлено' : 'Событие создано' });
      await loadEvents();
    } catch (e) {
      const text = apiErrorToText(e);
      setEventFormError(text);
      setToast({ kind: 'error', text });
      if ((e as ApiError)?.status === 401) nav('/admin/login', { replace: true });
    } finally {
      setEventSaving(false);
    }
  };

  const openCreateGallery = () => {
    setGalleryEditId(null);
    setGalleryForm({ title: '', tag: 'Новый раздел', image: '' });
    setGalleryFile(null);
    setGalleryFormError(null);
    setGalleryModalOpen(true);
  };

  const openEditGallery = (g: GalleryDto) => {
    setGalleryEditId(g.id);
    setGalleryForm({ title: g.title, tag: g.tag, image: g.image });
    setGalleryFile(null);
    setGalleryFormError(null);
    setGalleryModalOpen(true);
  };

  const saveGallery = async () => {
    setGalleryFormError(null);
    setGallerySaving(true);
    try {
      let image = galleryForm.image;
      if (galleryFile) {
        const up = await uploadImage(galleryFile);
        image = up.url;
      }

      const payload = { ...galleryForm, image: image || '/assets/brandbook.png' };
      if (galleryEditId) await updateGallery(galleryEditId, payload);
      else await createGallery(payload);

      setGalleryModalOpen(false);
      setToast({ kind: 'ok', text: galleryEditId ? 'Элемент обновлён' : 'Элемент добавлен' });
      await loadGallery();
    } catch (e) {
      const text = apiErrorToText(e);
      setGalleryFormError(text);
      setToast({ kind: 'error', text });
      if ((e as ApiError)?.status === 401) nav('/admin/login', { replace: true });
    } finally {
      setGallerySaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === 'event') await deleteEvent(confirm.id);
      else await deleteGallery(confirm.id);
      setConfirm(null);
      setToast({ kind: 'ok', text: 'Удалено' });
      if (confirm.kind === 'event') await loadEvents();
      else await loadGallery();
    } catch (e) {
      const text = apiErrorToText(e);
      setToast({ kind: 'error', text });
      if ((e as ApiError)?.status === 401) nav('/admin/login', { replace: true });
    }
  };

  const eventsPages = Math.max(1, Math.ceil(eventsTotal / eventsLimit));
  const galleryPages = Math.max(1, Math.ceil(galleryTotal / galleryLimit));
  const joinPages = Math.max(1, Math.ceil(joinTotal / joinLimit));

  const onSearchEvents = async () => {
    setEventsPage(1);
    await loadEvents();
  };
  const onSearchGallery = async () => {
    setGalleryPage(1);
    await loadGallery();
  };

  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / admin" a="Админ" b="панель" />

        <div className="admin-stats">
          {stats.map((s, i) => (
            <div key={i}>
              <b>{s.b}</b>
              <span>{s.s}</span>
            </div>
          ))}
        </div>

        {toast && (
          <div className={`admin-alert ${toast.kind === 'ok' ? 'admin-alert-ok' : 'admin-alert-error'}`} style={{ marginBottom: 14 }}>
            {toast.text}
          </div>
        )}

        <div className="admin-grid">
          <section className="panel">
            <div className="admin-toolbar">
              <div className="search">
                <input
                  placeholder="Поиск по событиям…"
                  value={eventsQ}
                  onChange={(e) => setEventsQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearchEvents()}
                />
              </div>
              <div className="actions">
                <button className="button button-outline" onClick={onSearchEvents}><Search size={16} /> Найти</button>
                <button className="button button-lime" onClick={openCreateEvent}><Plus size={16} /> Событие</button>
              </div>
            </div>
            {eventsError && <div className="admin-alert admin-alert-error">{eventsError}</div>}
            {eventsLoading ? (
              <p className="admin-muted">Загрузка…</p>
            ) : (
              <>
                <h3>Управление событиями</h3>
                {events.map((e) => (
                  <div className="admin-row" key={e.id}>
                    <div>
                      <Tag>{e.category}</Tag>
                      <h4>{e.title}</h4>
                      <p>{e.date} • {e.location}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button onClick={() => openEditEvent(e)} title="Редактировать" aria-label="Редактировать"><Pencil /></button>
                      <button onClick={() => setConfirm({ kind: 'event', id: e.id, title: e.title })} title="Удалить" aria-label="Удалить"><Trash2 /></button>
                    </div>
                  </div>
                ))}
                <div className="admin-pager">
                  <span className="admin-mini">страница <b>{eventsPage}</b> / {eventsPages}</span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="button button-outline" onClick={() => setEventsPage(Math.max(1, eventsPage - 1))} disabled={eventsPage <= 1}>Назад</button>
                    <button className="button button-outline" onClick={() => setEventsPage(Math.min(eventsPages, eventsPage + 1))} disabled={eventsPage >= eventsPages}>Дальше</button>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="panel">
            <div className="admin-toolbar">
              <div className="search">
                <input
                  placeholder="Поиск по галерее…"
                  value={galleryQ}
                  onChange={(e) => setGalleryQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearchGallery()}
                />
              </div>
              <div className="actions">
                <button className="button button-outline" onClick={onSearchGallery}><Search size={16} /> Найти</button>
                <button className="button button-pink" onClick={openCreateGallery}><Camera size={16} /> Галерея</button>
              </div>
            </div>
            {galleryError && <div className="admin-alert admin-alert-error">{galleryError}</div>}
            {galleryLoading ? (
              <p className="admin-muted">Загрузка…</p>
            ) : (
              <>
                <h3>Управление галереей</h3>
                {gallery.map((g) => (
                  <div className="admin-row" key={g.id}>
                    <div>
                      <Tag color="white">{g.tag}</Tag>
                      <h4>{g.title}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button onClick={() => openEditGallery(g)} title="Редактировать" aria-label="Редактировать"><Pencil /></button>
                      <button onClick={() => setConfirm({ kind: 'gallery', id: g.id, title: g.title })} title="Удалить" aria-label="Удалить"><Trash2 /></button>
                    </div>
                  </div>
                ))}
                <div className="admin-pager">
                  <span className="admin-mini">страница <b>{galleryPage}</b> / {galleryPages}</span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="button button-outline" onClick={() => setGalleryPage(Math.max(1, galleryPage - 1))} disabled={galleryPage <= 1}>Назад</button>
                    <button className="button button-outline" onClick={() => setGalleryPage(Math.min(galleryPages, galleryPage + 1))} disabled={galleryPage >= galleryPages}>Дальше</button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="admin-grid" style={{ marginTop: 22 }}>
          <RaffleAdminTickets />

          <section className="panel" style={{ gridColumn: '1 / -1' }}>
            <h3>Календарь (кнопка на главной)</h3>
            <p className="admin-muted" style={{ marginBottom: 14 }}>
              Текст и внутренняя ссылка (начинается с /). Список мероприятий по-прежнему в разделе «События» ниже.
            </p>
            {settingsLoading ? (
              <p className="admin-muted">Загрузка…</p>
            ) : (
              <div className="admin-split">
                <input
                  placeholder="Подпись, напр. «календарь»"
                  value={calSettings.calendarLabel}
                  onChange={(e) => setCalSettings({ ...calSettings, calendarLabel: e.target.value })}
                />
                <input
                  placeholder="Путь, напр. /events или /#join"
                  value={calSettings.calendarPath}
                  onChange={(e) => setCalSettings({ ...calSettings, calendarPath: e.target.value })}
                />
              </div>
            )}
            <div className="admin-actions-row" style={{ justifyContent: 'flex-start' }}>
              <button className="button button-lime" type="button" onClick={saveCalendarSettings} disabled={settingsSaving || settingsLoading}>
                {settingsSaving ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </div>
          </section>

          <section className="panel" style={{ gridColumn: '1 / -1' }}>
            <h3>Заявки с главной</h3>
            {joinError && <div className="admin-alert admin-alert-error">{joinError}</div>}
            {joinLoading ? (
              <p className="admin-muted">Загрузка…</p>
            ) : joinList.length === 0 ? (
              <p className="admin-muted">Пока нет заявок.</p>
            ) : (
              <>
                {joinList.map((j) => (
                  <div className="admin-row" key={j.id} style={{ display: 'block' }}>
                    <div className="admin-mini" style={{ marginBottom: 6 }}>
                      #{j.id} • {new Date(j.createdAt).toLocaleString('ru-RU')}
                    </div>
                    <b>{j.name}</b>
                    <p className="admin-muted" style={{ margin: '6px 0' }}>
                      {j.contact}
                    </p>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{j.message}</p>
                  </div>
                ))}
                <div className="admin-pager">
                  <span className="admin-mini">
                    заявок: <b>{joinTotal}</b> • стр. <b>{joinPage}</b> / {joinPages}
                  </span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="button button-outline" type="button" onClick={() => setJoinPage((p) => Math.max(1, p - 1))} disabled={joinPage <= 1}>
                      Назад
                    </button>
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() => setJoinPage((p) => Math.min(joinPages, p + 1))}
                      disabled={joinPage >= joinPages}
                    >
                      Дальше
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="button button-outline" onClick={onLogout}><LogOut size={16} /> Выйти</button>
        </div>
      </div>

      <Modal
        open={eventModalOpen}
        title={eventEditId ? 'Редактировать событие' : 'Создать событие'}
        onClose={() => setEventModalOpen(false)}
      >
        <div className="form">
          <div className="admin-split">
            <input placeholder="Название" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <input placeholder="Категория" value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })} />
            <input placeholder="Дата" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
            <input placeholder="Локация" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
            <textarea className="full" placeholder="Описание" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
          </div>

          <div className="admin-toolbar" style={{ marginTop: 6, marginBottom: 0 }}>
            <div className="actions">
              <span className="admin-mini">Статус:</span>
              <select
                value={eventForm.status}
                onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as EventStatus })}
                style={{ background: '#000', color: '#fff', border: '1px solid var(--line)', padding: '14px 14px', minHeight: 52 }}
              >
                {EVENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-file">
            <b><ImagePlus size={16} /> Картинка</b>
            <div style={{ height: 10 }} />
            <input placeholder="URL (или загрузка ниже)" value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setEventFile(e.target.files?.[0] || null)} />
          </div>

          {!!eventPreviewUrl && (
            <div className="admin-preview">
              <img src={eventPreviewUrl} alt="preview" />
              <div>
                <div className="admin-mini">предпросмотр</div>
                <div className="admin-muted">Если выбрана загрузка — URL автоматически подставится после сохранения.</div>
              </div>
            </div>
          )}

          {eventFormError && <div className="admin-alert admin-alert-error">{eventFormError}</div>}
          <div className="admin-actions-row">
            <button className="button button-outline" onClick={() => setEventModalOpen(false)} disabled={eventSaving}>Отмена</button>
            <button className="button button-lime" onClick={saveEvent} disabled={eventSaving || !eventForm.title.trim()}>
              {eventSaving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={galleryModalOpen}
        title={galleryEditId ? 'Редактировать галерею' : 'Добавить в галерею'}
        onClose={() => setGalleryModalOpen(false)}
      >
        <div className="form">
          <input placeholder="Название" value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} />
          <input placeholder="Тег" value={galleryForm.tag} onChange={(e) => setGalleryForm({ ...galleryForm, tag: e.target.value })} />

          <div className="admin-file">
            <b><ImagePlus size={16} /> Картинка</b>
            <div style={{ height: 10 }} />
            <input placeholder="URL (или загрузка ниже)" value={galleryForm.image} onChange={(e) => setGalleryForm({ ...galleryForm, image: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} />
          </div>

          {!!galleryPreviewUrl && (
            <div className="admin-preview">
              <img src={galleryPreviewUrl} alt="preview" />
              <div>
                <div className="admin-mini">предпросмотр</div>
                <div className="admin-muted">Если выбрана загрузка — URL автоматически подставится после сохранения.</div>
              </div>
            </div>
          )}

          {galleryFormError && <div className="admin-alert admin-alert-error">{galleryFormError}</div>}
          <div className="admin-actions-row">
            <button className="button button-outline" onClick={() => setGalleryModalOpen(false)} disabled={gallerySaving}>Отмена</button>
            <button className="button button-pink" onClick={saveGallery} disabled={gallerySaving || !galleryForm.title.trim()}>
              {gallerySaving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirm} title="Подтвердить удаление" onClose={() => setConfirm(null)}>
        <div className="form">
          <div className="admin-alert admin-alert-error">
            Удалить “{confirm?.title}”? Действие необратимо.
          </div>
          <div className="admin-actions-row">
            <button className="button button-outline" onClick={() => setConfirm(null)}>Отмена</button>
            <button className="button button-pink" onClick={doDelete}>Удалить</button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
