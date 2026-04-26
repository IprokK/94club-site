type Props = { compact?: boolean };

export default function Logo94({ compact = false }: Props) {
  return (
    <div className={`logo94 ${compact ? 'compact' : ''}`}>
      <img className="logo-img" src="/assets/logo_site.png" alt="94 Club" />
    </div>
  );
}
