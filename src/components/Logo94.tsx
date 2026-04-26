type Props = { compact?: boolean };

export default function Logo94({ compact = false }: Props) {
  return (
    <div className={`logo94 ${compact ? 'compact' : ''}`}>
      <div className="logo-main">
        <span className="logo-nine">9</span>
        <span className="logo-slash" />
        <span className="logo-four">4</span>
      </div>
      <div className="logo-word"><span>К</span><span>Л</span><span>У</span><span>Б</span></div>
      {!compact && <div className="logo-tagline"><span>сообщество</span><b>•</b><span>рост</span><b>•</b><span>вдохновение</span></div>}
    </div>
  );
}
