import { ReactNode } from 'react';

export function Tag({ children, color = 'lime' }: { children: ReactNode; color?: 'lime' | 'pink' | 'white' }) {
  return <span className={`tag tag-${color}`}>{children}</span>;
}

export function SectionTitle({ kicker, a, b }: { kicker: string; a: string; b: string }) {
  return (
    <div className="section-title">
      <p>{kicker}</p>
      <h2>{a} <span>{b}</span></h2>
    </div>
  );
}

export function ButtonLink({ children, variant = 'lime', href = '#' }: { children: ReactNode; variant?: 'lime' | 'outline' | 'pink'; href?: string }) {
  return <a className={`button button-${variant}`} href={href}>{children}</a>;
}

export function AccentStripes() {
  return <div className="accent-stripes"><i /><i /><i /></div>;
}
