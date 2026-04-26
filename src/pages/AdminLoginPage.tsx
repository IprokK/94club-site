import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { login as apiLogin } from '../api/auth';
import type { ApiError } from '../api/client';
import { SectionTitle, Tag } from '../components/UI';

function errorToText(err: unknown) {
  const e = err as Partial<ApiError>;
  if (e?.status === 401) return 'Неверный логин или пароль';
  return 'Ошибка входа. Попробуй ещё раз.';
}

export default function AdminLoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as unknown as { state?: { from?: string } };
  const backTo = useMemo(() => loc?.state?.from || '/admin', [loc]);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiLogin(login, password);
      nav(backTo, { replace: true });
    } catch (e) {
      setError(errorToText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-pad">
      <div className="container">
        <SectionTitle kicker="94 клуб / admin" a="Вход" b="в админку" />

        <div className="admin-grid">
          <section className="panel form">
            <h3><Shield /> Авторизация</h3>
            <div className="tag-row">
              <Tag>JWT</Tag>
              <Tag color="pink">protected</Tag>
            </div>
            <input placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" />
            <input placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" />
            {error && <div className="admin-alert admin-alert-error">{error}</div>}
            <button className="button button-lime" onClick={onSubmit} disabled={loading || !login || !password}>
              {loading ? 'Входим…' : 'Войти'}
            </button>
            <div className="admin-hint">
              <span>Подсказка:</span> логин/пароль берутся из `server/.env` (ADMIN_LOGIN / ADMIN_PASSWORD)
            </div>
          </section>

          <section className="panel">
            <h3>Доступ</h3>
            <p className="admin-muted">
              Это закрытая зона управления контентом. После входа можно создавать, редактировать и удалять события и элементы галереи.
            </p>
            <div className="admin-divider" />
            <p className="admin-muted">
              Если backend недоступен или токен протух — вернём на эту страницу.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

