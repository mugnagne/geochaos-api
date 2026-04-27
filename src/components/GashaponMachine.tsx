import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from './TranslationProvider';

interface Props {
  isPulling: boolean;
}

export function GashaponMachine({ isPulling }: Props) {
  const { language } = useTranslation();
  // Define animation for jumping capsules
  const capsuleAnimation = {
    y: isPulling ? [0, -20, 10, -10, 5, 0] : 0,
    x: isPulling ? [0, 5, -5, 5, -5, 0] : 0,
    rotate: isPulling ? [0, 15, -15, 10, -10, 0] : 0,
  };

  const getTransition = (delay: number) => ({
    duration: 0.5,
    repeat: isPulling ? 3 : 0,
    delay: delay,
    ease: "easeInOut"
  });

  return (
    <div className="relative w-64 h-96 flex flex-col items-center justify-end">
      {/* Container / Top Dome */}
      <div className="absolute top-0 w-56 h-56 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/30 overflow-hidden shadow-inner flex flex-wrap items-center justify-center p-4 gap-2 z-0">
        <div className="absolute w-full flex flex-wrap justify-center bottom-4 gap-2">
           <motion.div animate={capsuleAnimation} transition={getTransition(0)} className="w-12 h-12 rounded-full bg-accent-cyan/80 border-2 border-white shadow-lg relative z-10"><div className="absolute top-0 w-full h-1/2 bg-white/20 rounded-t-full"></div></motion.div>
           <motion.div animate={capsuleAnimation} transition={getTransition(0.1)} className="w-12 h-12 rounded-full bg-accent-magenta/80 border-2 border-white shadow-lg relative -ml-4 z-20"><div className="absolute top-0 w-full h-1/2 bg-white/20 rounded-t-full"></div></motion.div>
           <motion.div animate={capsuleAnimation} transition={getTransition(0.2)} className="w-12 h-12 rounded-full bg-accent-yellow/80 border-2 border-white shadow-lg relative -ml-4 z-30"><div className="absolute top-0 w-full h-1/2 bg-white/20 rounded-t-full"></div></motion.div>
           <motion.div animate={capsuleAnimation} transition={getTransition(0.05)} className="w-12 h-12 rounded-full bg-accent-purple/80 border-2 border-white shadow-lg relative z-20 mt-[-10px]"><div className="absolute top-0 w-full h-1/2 bg-white/20 rounded-t-full"></div></motion.div>
           <motion.div animate={capsuleAnimation} transition={getTransition(0.15)} className="w-12 h-12 rounded-full bg-accent-orange/80 border-2 border-white shadow-lg relative -ml-4 mt-[-10px] z-10"><div className="absolute top-0 w-full h-1/2 bg-white/20 rounded-t-full"></div></motion.div>
        </div>
      </div>
      
      {/* Machine Body */}
      <div className="w-64 h-48 bg-accent-magenta rounded-t-3xl rounded-b-xl border-4 border-white shadow-[0_0_20px_#FF3AF2] relative flex flex-col items-center z-10">
        
        {/* Price Tag */}
        <div className="absolute top-4 right-4 bg-accent-yellow text-max-bg font-black px-2 py-1 rounded-lg border-2 border-max-bg text-sm transform rotate-12 shadow-md">
          10 {language === 'fr' ? 'PIÈCES' : 'COINS'}
        </div>

        {/* Turn Handle Area */}
        <div className="w-24 h-24 bg-max-bg/50 rounded-full mt-8 border-4 border-white/20 flex items-center justify-center relative shadow-inner">
          <motion.div 
            animate={isPulling ? { rotate: 720 } : { rotate: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="w-16 h-16 bg-white rounded-full border-4 border-accent-cyan relative flex items-center justify-center shadow-md cursor-pointer"
          >
            <div className="absolute w-2 h-4 bg-accent-cyan top-1 rounded-full"></div>
            <div className="absolute w-4 h-2 bg-accent-cyan left-1 rounded-full"></div>
            <div className="absolute w-2 h-4 bg-accent-cyan bottom-1 rounded-full"></div>
            <div className="absolute w-4 h-2 bg-accent-cyan right-1 rounded-full"></div>
            
            {/* Center dot */}
            <div className="w-4 h-4 bg-accent-magenta border-2 border-white rounded-full z-10"></div>
          </motion.div>
        </div>

        {/* Output Chute */}
        <div className="w-16 h-16 bg-max-bg rounded-lg border-2 border-white/40 absolute bottom-4 left-6 flex items-end justify-center overflow-hidden shadow-inner">
          <div className="w-full h-3/4 bg-black/60 rounded-t-lg"></div>
        </div>
      </div>
      
      {/* Falling Capsule Animation */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ y: -60, x: -60, opacity: 0, scale: 0.5 }}
            animate={{ 
              y: [null, 60, 30, 60], 
              x: -60,
              opacity: 1, 
              rotate: 360,
              scale: 1 
            }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute z-20 bottom-4 left-7 w-14 h-14 rounded-full bg-accent-yellow border-2 border-white flex flex-col items-center justify-center shadow-[0_0_15px_#FFE600]"
          >
            <div className="absolute top-0 w-full h-1/2 bg-white/50 rounded-t-full"></div>
            <Sparkles className="text-white z-10 drop-shadow-md" size={24} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
