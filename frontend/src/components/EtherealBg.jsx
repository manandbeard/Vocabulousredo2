import { motion } from 'framer-motion';

export default function EtherealBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute w-[500px] h-[500px] soft-glow-lavender"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '-10%', right: '-5%' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] soft-glow-peach"
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{ bottom: '-5%', left: '-8%' }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] soft-glow-mint"
        animate={{ x: [0, 25, -15, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '40%', left: '50%' }}
      />
    </div>
  );
}
