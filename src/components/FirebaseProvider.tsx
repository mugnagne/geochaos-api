import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, loginWithGoogle, logout } from '../lib/firebase';
import { OwnedCard } from '../types';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  coins: number;
  setCoins: (coins: number) => void;
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Initialize user document if not exists
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              coins: localCoins,
              highScore: localHighScore || 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            // Also sync local cards
            for (const card of localOwnedCards) {
               // countryName shouldn't contain spaces for document ID, we use safe id
               const safeId = card.countryName.replace(/[^a-zA-Z0-9_-]/g, '_');
               await setDoc(doc(db, `users/${currentUser.uid}/cards/${safeId}`), {
                 countryName: card.countryName,
                 obtainedAt: card.obtainedAt,
                 count: card.count
               });
            }
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, 'users');
        }

        // Subscribe to user doc
        const unsubsUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCoins(data.coins);
            setHighScore(data.highScore > 0 ? data.highScore : null);
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));

        // Subscribe to cards subcollection
        const cardsRef = collection(db, `users/${currentUser.uid}/cards`);
        const unsubsCards = onSnapshot(cardsRef, (querySnap) => {
          const cards: OwnedCard[] = [];
          querySnap.forEach((doc) => {
            cards.push(doc.data() as OwnedCard);
          });
          setOwnedCards(cards);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'users/cards'));

        setLoading(false);

        return () => {
          unsubsUser();
          unsubsCards();
        };

      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [localCoins, localHighScore, localOwnedCards]);

  const updateCoins = async (newCoins: number) => {
    if (user) {
      setCoins(newCoins);
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, { coins: newCoins, updatedAt: serverTimestamp() });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'users');
      }
    } else {
      setLocalCoins(newCoins);
      localStorage.setItem('geochaos_coins', newCoins.toString());
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
