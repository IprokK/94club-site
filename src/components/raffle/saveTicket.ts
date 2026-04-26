import type { RaffleEntry } from '../../api/raffle';

export function saveTicketImage(entry: Pick<RaffleEntry, 'ticketNumber' | 'name'>) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid lines
  ctx.strokeStyle = 'rgba(255,255,255,.10)';
  ctx.lineWidth = 2;
  for (let x = 0; x < canvas.width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // stripes
  const lime = '#d9ff00';
  const pink = '#ff2d55';
  ctx.save();
  ctx.translate(120, 560);
  ctx.transform(1, 0, -0.45, 1, 0, 0);
  ctx.fillStyle = lime;
  ctx.fillRect(0, 0, 260, 26);
  ctx.fillStyle = pink;
  ctx.fillRect(280, 0, 260, 26);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(560, 0, 160, 26);
  ctx.restore();

  // text
  ctx.fillStyle = 'rgba(255,255,255,.70)';
  ctx.font = '700 24px Montserrat, Arial, sans-serif';
  ctx.fillText('94 CLUB RAFFLE', 80, 92);

  ctx.fillStyle = lime;
  ctx.font = '900 120px Montserrat, Arial, sans-serif';
  ctx.fillText(entry.ticketNumber, 80, 250);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px Montserrat, Arial, sans-serif';
  ctx.fillText(entry.name.toUpperCase().slice(0, 18), 80, 340);

  ctx.fillStyle = 'rgba(255,255,255,.62)';
  ctx.font = '800 26px Montserrat, Arial, sans-serif';
  ctx.fillText('СОХРАНИ БИЛЕТ. ВЫИГРЫШ ОДИН РАЗ.', 80, 420);

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `94club-ticket-${entry.ticketNumber.replace('#', '')}.png`;
  a.click();
}

