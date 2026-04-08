import { useCallback } from 'react';
import { collection, addDoc, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from './firebase';

// Human-readable descriptions for each action type
const ACTION_DESCRIPTIONS = {
  en: {
    ADD_VENDA: (p) => `Recorded sale: ${p.produto} — $${p.valorFinal?.toFixed(2) || '0.00'}`,
    DEL_VENDA: () => 'Deleted a sale',
    ADD_COMPRA: (p) => `Added purchase from: ${p.fornecedor}`,
    DEL_COMPRA: () => 'Deleted a purchase',
    UPDATE_COMPRA_STATUS: (_, a) => `Updated purchase status to: ${a.status}`,
    ADD_ESTOQUE: (p) => `Added to stock: ${p.produto} (${p.tamanho}) x${p.quantidade}`,
    DEL_ESTOQUE: () => 'Removed item from stock',
    UPDATE_ESTOQUE_QTD: (_, a) => `Updated stock quantity to: ${a.quantidade}`,
    ADD_CUSTO: (p) => `Added fixed cost: ${p.nome} — $${p.valorTotal?.toFixed(2) || '0.00'}`,
    DEL_CUSTO: () => 'Deleted a fixed cost',
    RESET_VENDAS: () => 'Cleared all sales',
    RESET_ESTOQUE: () => 'Reset all inventory',
  },
  pt: {
    ADD_VENDA: (p) => `Registrou venda: ${p.produto} — $${p.valorFinal?.toFixed(2) || '0.00'}`,
    DEL_VENDA: () => 'Excluiu uma venda',
    ADD_COMPRA: (p) => `Adicionou compra de: ${p.fornecedor}`,
    DEL_COMPRA: () => 'Excluiu uma compra',
    UPDATE_COMPRA_STATUS: (_, a) => `Atualizou status da compra para: ${a.status}`,
    ADD_ESTOQUE: (p) => `Adicionou ao estoque: ${p.produto} (${p.tamanho}) x${p.quantidade}`,
    DEL_ESTOQUE: () => 'Removeu item do estoque',
    UPDATE_ESTOQUE_QTD: (_, a) => `Atualizou quantidade no estoque para: ${a.quantidade}`,
    ADD_CUSTO: (p) => `Adicionou custo fixo: ${p.nome} — $${p.valorTotal?.toFixed(2) || '0.00'}`,
    DEL_CUSTO: () => 'Excluiu um custo fixo',
    RESET_VENDAS: () => 'Limpou todas as vendas',
    RESET_ESTOQUE: () => 'Resetou todo o estoque',
  },
};

const ACTION_CATEGORIES = {
  ADD_VENDA: 'vendas', DEL_VENDA: 'vendas', RESET_VENDAS: 'vendas',
  ADD_COMPRA: 'compras', DEL_COMPRA: 'compras', UPDATE_COMPRA_STATUS: 'compras',
  ADD_ESTOQUE: 'estoque', DEL_ESTOQUE: 'estoque', UPDATE_ESTOQUE_QTD: 'estoque',
  ADD_CUSTO: 'custos', DEL_CUSTO: 'custos',
  RESET_ESTOQUE: 'estoque',
};

// Actions that should NOT be logged
const SKIP_ACTIONS = ['LOAD_STATE'];

/**
 * Returns a wrapped dispatch that logs every action to Firestore history
 */
export function useActionHistory(user, dispatch, lang = 'pt') {
  const loggedDispatch = useCallback((action) => {
    // Always dispatch the action first
    dispatch(action);

    // Skip logging for internal actions or when no user
    if (!user || SKIP_ACTIONS.includes(action.type)) return;

    // Generate description
    const descFn = ACTION_DESCRIPTIONS[lang]?.[action.type] || ACTION_DESCRIPTIONS['pt']?.[action.type];
    const description = descFn ? descFn(action.payload || {}, action) : action.type;
    const category = ACTION_CATEGORIES[action.type] || 'other';

    // Log to Firestore (fire-and-forget)
    const historyRef = collection(db, 'users', user.uid, 'history');
    addDoc(historyRef, {
      action: action.type,
      description,
      category,
      timestamp: new Date().toISOString(),
      details: action.payload ? JSON.parse(JSON.stringify(action.payload)) : null,
    }).catch(err => console.error('Error logging action:', err));
  }, [user, dispatch, lang]);

  return loggedDispatch;
}

/**
 * Fetch history entries from Firestore with pagination
 */
export async function fetchHistory(userId, limitCount = 50, afterDoc = null) {
  const historyRef = collection(db, 'users', userId, 'history');
  let q;
  if (afterDoc) {
    q = query(historyRef, orderBy('timestamp', 'desc'), startAfter(afterDoc), limit(limitCount));
  } else {
    q = query(historyRef, orderBy('timestamp', 'desc'), limit(limitCount));
  }
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
  return { entries, lastDoc, hasMore: snapshot.docs.length === limitCount };
}
