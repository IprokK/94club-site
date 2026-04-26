import { NavLink, Outlet } from 'react-router-dom';
import { Home, Info, CalendarDays, Image, Users, Rocket, Shield, Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import Logo94 from './Logo94';

const links = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/about', label: 'О клубе', icon: Info },
  { to: '/events', label: 'Мероприятия', icon: CalendarDays },
  { to: '/gallery', label: 'Галерея', icon: Image },
  { to: '/join', label: 'Присоединиться', icon: Users },
  { to: '/partners', label: 'Партнёрам', icon: Rocket },
  { to: '/admin', label: 'Админ', icon: Shield }
];

function Navigation({ close }: { close?: () => void }) {
  return (
    <nav className="nav-list">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} onClick={close} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="site-shell">
      <div className="bg-grid" />
      <header className="header">
        <div className="container header-inner">
          <NavLink to="/" className="brand-mini" onClick={() => setOpen(false)}>
            <span>94 клуб</span>
            <b>/</b>
            <span>сообщество</span>
          </NavLink>
          <div className="desktop-nav"><Navigation /></div>
          <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label="Меню">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && <div className="mobile-nav"><Navigation close={() => setOpen(false)} /></div>}
      </header>
      <Outlet />
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-logo"><Logo94 compact /></div>
          <div className="footer-line"><span>сообщество</span><i>•</i><span>рост</span><i>•</i><span>вдохновение</span></div>
          <div className="footer-heart"><Heart size={16} /> 94 Club — это твоя история</div>
        </div>
      </footer>
    </div>
  );
}
