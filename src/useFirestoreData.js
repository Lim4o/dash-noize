import { useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Custom hook that syncs reducer state with Firestore.
 * - Loads data from Firestore on mount (when user is available)
 * - Saves data to Firestore on state changes (debounced)
 * - Falls back to localStorage if no user
 */
export function useFirestoreData(user, state, dispatch) {
  const saveTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const hasLoadedRef = useRef(false);

  // Load data from Firestore when user logs in
  useEffect(() => {
    if (!user) {
      hasLoadedRef.current = false;
      return;
    }
    if (hasLoadedRef.current) return;

    const loadData = async () => {
      try {
        const docRef = doc(db, 'shared', 'financial');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          dispatch({ type: 'LOAD_STATE', payload: data });
        }
        hasLoadedRef.current = true;
        isInitialLoadRef.current = false;
      } catch (error) {
        console.error('Error loading Firestore data:', error);
        isInitialLoadRef.current = false;
      }
    };

    loadData();
  }, [user, dispatch]);

  // Save data to Firestore when state changes (debounced 1.5s)
  useEffect(() => {
    if (!user || isInitialLoadRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        const docRef = doc(db, 'shared', 'financial');
        await setDoc(docRef, {
          vendas: state.vendas,
          compras: state.compras,
          estoque: state.estoque,
          custosFixos: state.custosFixos,
          clientes: state.clientes || [],
          fornecedores: state.fornecedores || [],
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving to Firestore:', error);
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [user, state]);
}
