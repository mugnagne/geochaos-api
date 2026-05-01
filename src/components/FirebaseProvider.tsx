import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, loginWithGoogle, logout } from '../lib/firebase';
import { OwnedCard } from '../types';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  connectionStatus: 'online' | 'offline' | 'checking';
  coins: number;
  setCoins: (coins: number | ((prev: number) => number)) => void;
  highScore: number | null;
  setHighScore: (score: number) => void;
  ownedCards: OwnedCard[];
  addCard: (countryName: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within a FirebaseProvider');
  return context;
};

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [coins, setCoins] = useState<number>(0);
  const [highScore, setHighScore] = useState<number | null>(null);
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);

  // Local state fallback when not logged in
  const [localCoins, setLocalCoins] = useState(() => parseInt(localStorage.getItem('geochaos_coins') || '0'));
  const [localHighScore, setLocalHighScore] = useState<number | null>(() => {
    const saved = localStorage.getItem('geochaos_highscore_v2');
    return saved ? parseInt(saved) : null;
  });
  const [localOwnedCards, setLocalOwnedCards] = useState<OwnedCard[]>(() => {
    const saved = localStorage.getItem('geochaos_cards');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    let unsubsUser: (() => void) | null = null;
    let unsubsCards: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Clean up previous subscriptions if any
      if (unsubsUser) unsubsUser();
      if (unsubsCards) unsubsCards();

      if (currentUser) {
        setConnectionStatus('checking');
        setLoading(true);

        const userRef = doc(db, 'users', currentUser.uid);
        
        // Initial setup - don't block subscriptions on this
        (async () => {
          try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                coins: localCoins,
                highScore: localHighScore || 0,
                displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Anonyme'),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              
              for (const card of localOwnedCards) {
                const safeId = card.countryName.replace(/[^a-zA-Z0-9_-]/g, '_');
                await setDoc(doc(db, `users/${currentUser.uid}/cards/${safeId}`), {
                  countryName: card.countryName,
                  obtainedAt: card.obtainedAt,
                  count: card.count
                });
              }
            } else {
              const currentName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Anonyme');
              if (userSnap.data().displayName !== currentName) {
                await updateDoc(userRef, { displayName: currentName, updatedAt: serverTimestamp() });
              }
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.GET, 'users/init');
          }
        })();

        // Subscriptions
        unsubsUser = onSnapshot(userRef, { includeMetadataChanges: true }, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCoins(data.coins);
            setHighScore(data.highScore > 0 ? data.highScore : null);
          }
          
          if (!docSnap.metadata.fromCache) {
            setConnectionStatus('online');
          }
          setLoading(false);
        }, (err) => {
          const isOffline = err.message.toLowerCase().includes('offline');
          if (isOffline) {
            setConnectionStatus('offline');
          }
          handleFirestoreError(err, OperationType.GET, 'users');
          setLoading(false);
        });

        const cardsRef = collection(db, `users/${currentUser.uid}/cards`);
        unsubsCards = onSnapshot(cardsRef, { includeMetadataChanges: true }, (querySnap) => {
          const cards: OwnedCard[] = [];
          querySnap.forEach((doc) => {
            cards.push(doc.data() as OwnedCard);
          });
          setOwnedCards(cards);
          
          if (!querySnap.metadata.fromCache) {
            setConnectionStatus('online');
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'users/cards');
        });

      } else {
        setLoading(false);
        setConnectionStatus('online'); // Local mode
        setCoins(localCoins);
        setHighScore(localHighScore);
        setOwnedCards(localOwnedCards);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubsUser) unsubsUser();
      if (unsubsCards) unsubsCards();
    };
  }, [localCoins, localHighScore, localOwnedCards]);

  const updateCoins = async (newCoins: number | ((prev: number) => number)) => {
    // Calculate the actual value to set
    const valueToSet = typeof newCoins === 'function' ? newCoins(user ? coins : localCoins) : newCoins;

    if (user) {
      setCoins(valueToSet);
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, { coins: valueToSet, updatedAt: serverTimestamp() });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'users');
      }
    } else {
      setLocalCoins(valueToSet);
      localStorage.setItem('geochaos_coins', valueToSet.toString());
    }
  };

  const updateHighScore = async (newScore: number) => {
    if (user) {
      if (highScore === null || newScore > highScore) {
        setHighScore(newScore);
        const userRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userRef, { highScore: newScore, updatedAt: serverTimestamp() });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, 'users');
        }
      }
    } else {
      if (localHighScore === null || newScore > localHighScore) {
        setLocalHighScore(newScore);
        localStorage.setItem('geochaos_highscore_v2', newScore.toString());
      }
    }
  };

  const addCard = async (countryName: string) => {
    if (user) {
      const safeId = countryName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const cardRef = doc(db, `users/${user.uid}/cards/${safeId}`);
      try {
        const snap = await getDoc(cardRef);
        if (snap.exists()) {
          const currentCount = snap.data().count;
          await updateDoc(cardRef, { count: currentCount + 1, obtainedAt: Date.now() });
        } else {
          await setDoc(cardRef, { countryName, count: 1, obtainedAt: Date.now() });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'users/cards');
      }
    } else {
      setLocalOwnedCards(prev => {
        const existing = prev.find(c => c.countryName === countryName);
        let newCards;
        if (existing) {
          newCards = prev.map(c => c.countryName === countryName ? { ...c, count: c.count + 1 } : c);
        } else {
          newCards = [...prev, { countryName, count: 1, obtainedAt: Date.now() }];
        }
        localStorage.setItem('geochaos_cards', JSON.stringify(newCards));
        return newCards;
      });
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      loading,
      connectionStatus,
      coins: user ? coins : localCoins,
      setCoins: updateCoins,
      highScore: user ? highScore : localHighScore,
      setHighScore: updateHighScore,
      ownedCards: user ? ownedCards : localOwnedCards,
      addCard,
      login: loginWithGoogle,
      logout
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}
