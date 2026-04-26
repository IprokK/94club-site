import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <main className="section-pad"><div className="container panel"><h1>404</h1><p>Такой страницы нет.</p><Link className="button button-lime" to="/">На главную</Link></div></main>;
}
