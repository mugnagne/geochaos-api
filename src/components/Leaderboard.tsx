import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Trophy, Medal, Crown } from 'lucide-react';
import { useTranslation } from './TranslationProvider';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  highScore: number;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('highScore', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const entries: LeaderboardEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.highScore > 0) {
            entries.push({
              id: doc.id,
              displayName: data.displayName || 'Anonyme',
              highScore: data.highScore
            });
          }
        });
        setLeaderboard(entries);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading && leaderboard.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <div className="animate-spin w-6 h-6 border-4 border-accent-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-4 sm:mt-6 bg-max-bg/80 backdrop-blur-md border-2 border-white/20 rounded-xl p-4 flex flex-col gap-3 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-magenta to-accent-yellow" />
      <h3 className="text-white text-center font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2">
        <Trophy className="text-accent-yellow w-4 h-4" />
        Leaderboard
        <Trophy className="text-accent-yellow w-4 h-4" />
      </h3>
      
      <div className="flex flex-col gap-2">
        {leaderboard.map((entry, index) => {
          let rankIcon = null;
          let colorClass = "text-white/80";
          if (index === 0) {
            rankIcon = <Crown className="text-accent-yellow w-4 h-4" />;
            colorClass = "text-accent-yellow font-bold text-shadow-yellow";
          } else if (index === 1) {
            rankIcon = <Medal className="text-gray-300 w-4 h-4" />;
            colorClass = "text-gray-300 font-bold";
          } else if (index === 2) {
            rankIcon = <Medal className="text-amber-600 w-4 h-4" />;
            colorClass = "text-amber-600 font-bold";
          }

          return (
            <div key={entry.id} className={`flex items-center justify-between text-xs sm:text-sm p-2 rounded-lg ${index < 3 ? 'bg-white/5' : ''}`}>
              <div className="flex items-center gap-2">
                <span className={`w-5 font-black text-center ${colorClass}`}>
                  {index + 1}.
                </span>
                {rankIcon}
                <span className={`truncate max-w-[150px] sm:max-w-[180px] ${colorClass}`}>
                  {entry.displayName}
                </span>
              </div>
              <span className={`font-black ${colorClass}`}>
                {entry.highScore}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
