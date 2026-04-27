import React from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react';
import { Country, Rarity } from '../types';
import { RARITIES } from '../data/rarities';
import { useTranslation } from './TranslationProvider';

interface Props {
  country: Country;
  rarity: Rarity;
  isNew: boolean;
  onClick?: () => void;
  className?: string;
}

export function GachaCard({ country, rarity, isNew, onClick, className = '' }: Props) {
  const rInfo = RARITIES[rarity];
  const { t, language, getFormattedCountryName } = useTranslation();
  const isGeo = rarity === 'GEOCHAOS';

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const reflectionX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const reflectionY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);
  // Metallic reflection effect using color-dodge
  const background = useMotionTemplate`radial-gradient(circle at ${reflectionX} ${reflectionY}, ${(rInfo as any).hex}A0 0%, transparent 50%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: "1000px" }} className={`w-full h-full ${className}`}>
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileHover={{ zIndex: 50, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`relative w-full aspect-[3/2] rounded-2xl flex flex-col justify-between p-3 sm:p-4 cursor-pointer shadow-2xl overflow-hidden group bg-gray-900
          ${isGeo ? 'holo-card border-[4px] border-transparent' : ''}
          ${rarity === 'LEGENDAIRE' ? 'border-[4px] border-yellow-400 shadow-[0_0_20px_#FFE600]' : ''}
          ${rarity === 'EPIQUE' ? 'border-[4px] border-purple-500 shadow-[0_0_15px_#7B2FFF]' : ''}
          ${rarity === 'RARE' ? 'border-[4px] border-blue-400' : ''}
          ${rarity === 'COMMUN' ? 'border-[4px] border-gray-400' : ''}
        `}
      >
      {/* Background Flag - Full Color */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-110"
        style={{
          backgroundImage: `url(${country.flagUrl || `https://flagcdn.com/w320/${country.abbreviation.toLowerCase()}.png`})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Vignette / Dark gradient to make text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 z-10 pointer-events-none" />

      {/* Rarity Reflection */}
      <motion.div 
        className="absolute inset-0 z-30 pointer-events-none mix-blend-color-dodge opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background }}
      />
      
      {/* Gloss effect overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-br from-white/30 via-transparent to-black/40 opacity-50" />

      <div className="flex justify-between items-start z-30 transform-gpu pointer-events-none" style={{ transform: "translateZ(30px)" }}>
        <span className={`text-[10px] sm:text-xs font-black uppercase px-2 py-1 bg-black/80 rounded text-white backdrop-blur-md shadow-sm border border-white/20`} style={{ color: (rInfo as any).hex }}>
          {t(`rarity_${(rarity === 'EPIQUE' ? 'epique' : rarity === 'LEGENDAIRE' ? 'legendaire' : rarity).toLowerCase()}` as any) || rInfo.label}
        </span>
        {isNew && (
          <span className="text-[10px] sm:text-xs font-black px-2 py-1 bg-accent-magenta text-white rounded animate-bounce shadow-max-cyan">
            {t('new_card')}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-end z-30 transform-gpu pointer-events-none" style={{ transform: "translateZ(40px)" }}>
        <h3 className={`font-black uppercase text-left text-xl sm:text-2xl lg:text-3xl leading-tight mb-1
          ${isGeo ? 'text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300 drop-shadow-lg text-shadow-magenta' : 'text-white text-shadow-md'}
        `}>
          {getFormattedCountryName(country.abbreviation, country.name)}
        </h3>
        <div className="text-left text-xs sm:text-sm font-bold text-white/90 drop-shadow-md">
          Pop: {country.population?.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
        </div>
      </div>
    </motion.div>
    </div>
  );
}
