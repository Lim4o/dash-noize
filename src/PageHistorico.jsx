import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchHistory } from './useActionHistory';
import {
  ShoppingBag, ShoppingCart, Package, Landmark, Clock,
  ArrowUpRight, ArrowDownRight, RefreshCw, Trash2, Edit3,
  Plus, CheckCircle, Filter
} from 'lucide-react';

const CATEGORY_CONFIG = {
  vendas:  { icon: ShoppingBag,  color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Vendas' },
  compras: { icon: ShoppingCart, color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Compras' },
  estoque: { icon: Package,     color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Estoque' },
  custos:  { icon: Landmark,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Custos' },
  other:   { icon: Clock,       color: '#6b7280', bg: 'rgba(107,114,128,0.12)',label: 'Outro' },
};

const ACTION_ICON = {
  ADD_VENDA: Plus, DEL_VENDA: Trash2,
  ADD_COMPRA: Plus, DEL_COMPRA: Trash2, UPDATE_COMPRA_STATUS: Edit3,
  ADD_ESTOQUE: Plus, DEL_ESTOQUE: Trash2, UPDATE_ESTOQUE_QTD: Edit3,
  ADD_CUSTO: Plus, DEL_CUSTO: Trash2,
  RESET_VENDAS: Trash2, RESET_ESTOQUE: Trash2,
};

function formatTimestamp(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `${diffMin}m atrás`;
  if (diffHrs < 24) return `${diffHrs}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PageHistorico({ t }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadHistory = async (reset = true) => {
    if (!user) return;
    if (reset) {
      setLoading(true);
      setEntries([]);
    } else {
      setLoadingMore(true);
    }
    try {
      const result = await fetchHistory(user.uid, 50, reset ? null : lastDoc);
      setEntries(prev => reset ? result.entries : [...prev, ...result.entries]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadHistory(true);
  }, [user]);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.category === filter);

  const FILTERS = [
    { id: 'all', label: 'Tudo' },
    { id: 'vendas', label: 'Vendas' },
    { id: 'compras', label: 'Compras' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'custos', label: 'Custos' },
  ];

  return (
    <>
      <div className="action-row" style={{ justifyContent: 'space-between' }}>
        <div className="filters-row" style={{ marginBottom: 0 }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => loadHistory(true)}>
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="history-loading">
            <div className="login-spinner" style={{ width: 28, height: 28 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>Carregando histórico...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="history-loading">
            <Clock size={48} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {filter === 'all' ? 'Nenhuma ação registrada ainda.' : `Nenhuma ação de "${FILTERS.find(f => f.id === filter)?.label}" encontrada.`}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              As ações aparecerão aqui conforme você usar o dashboard.
            </span>
          </div>
        ) : (
          <div className="history-timeline">
            {filtered.map((entry, i) => {
              const catCfg = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.other;
              const ActionIcon = ACTION_ICON[entry.action] || Clock;
              const isDelete = entry.action?.startsWith('DEL_') || entry.action?.startsWith('RESET_');
              return (
                <div key={entry.id} className="history-item">
                  <div className="history-line" />
                  <div className="history-dot" style={{ background: catCfg.bg, borderColor: catCfg.color }}>
                    <ActionIcon size={14} color={catCfg.color} />
                  </div>
                  <div className="history-content">
                    <div className="history-header">
                      <span className="badge" style={{ background: catCfg.bg, color: catCfg.color, fontSize: 10 }}>
                        {catCfg.label}
                      </span>
                      <span className="history-time">{formatTimestamp(entry.timestamp)}</span>
                    </div>
                    <div className="history-desc" style={{ color: isDelete ? '#ef4444' : 'var(--text-primary)' }}>
                      {entry.description}
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div style={{ padding: '16px 20px', textAlign: 'center' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => loadHistory(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Carregando...' : 'Carregar mais'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
