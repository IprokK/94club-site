type Props = { compact?: boolean };

import logo from '../assets/logo_site.png';

export default function Logo94({ compact = false }: Props) {
  return (
    <div className={`logo94 ${compact ? 'compact' : ''}`}>
      <img className="logo-img" src={logo} alt="94 Club" />
    </div>
  );
}
