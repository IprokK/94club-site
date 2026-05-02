import { motion } from 'framer-motion';
import type { RaffleEntry } from '../../api/raffle';
import { Tag } from '../UI';

export default function TicketCard({
  entry
}: {
  entry: Pick<RaffleEntry, 'ticketNumber' | 'name' | 'alreadyHadTicket'>;
}) {
  return (
    <motion.div
      className="raffle-ticket panel"
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="raffle-ticket-top">
        <Tag>94 Club</Tag>
        <Tag color="pink">raffle</Tag>
      </div>
      <div className="raffle-ticket-num">{entry.ticketNumber}</div>
      <div className="raffle-ticket-name">{entry.name}</div>
      {entry.alreadyHadTicket ? (
        <p className="raffle-ticket-note">Билет уже был выдан ранее — показываем тот же номер.</p>
      ) : null}
      <div className="raffle-ticket-foot">94 Club Raffle</div>
    </motion.div>
  );
}

