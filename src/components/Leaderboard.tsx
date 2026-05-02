import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { useTranslation } from './TranslationProvider';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  highScore: number;
  photoURL?: string;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let unsubs: (() => void) | null = null;
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('highScore', 'desc'),
        limit(10)
      );
      
      unsubs = onSnapshot(q, (querySnapshot) => {
        const entries: LeaderboardEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.highScore > 0) {
            entries.push({
              id: doc.id,
              displayName: data.displayName || 'Anonyme',
              highScore: data.highScore,
              photoURL: data.photoURL
            });
          }
        });

        // Add artificial entries
        entries.push(
          { id: 'artificial_1', displayName: "Le Vigile d'Audencia", highScore: 67 },
          { id: 'artificial_2', displayName: "m0nesy", highScore: 3 },
          { id: 'artificial_3', displayName: "Louis Sarkozy", highScore: 0.00001 }
        );

        // Sort descending and cap at 10 to include artificial entries properly
        entries.sort((a, b) => b.highScore - a.highScore);
        const top10Entries = entries.slice(0, 10);

        setLeaderboard(top10Entries);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
        setLoading(false);
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
      setLoading(false);
    }
    
    return () => {
      if (unsubs) unsubs();
    };
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
                <span className={`w-5 font-black text-center shrink-0 ${colorClass}`}>
                  {index + 1}.
                </span>
                {rankIcon}
                <div className="w-8 h-8 rounded-full bg-black/20 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {entry.photoURL ? (
                    <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className={`w-4 h-4 ${colorClass}`} />
                  )}
                </div>
                <span className={`truncate max-w-[130px] sm:max-w-[160px] ${colorClass}`}>
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
