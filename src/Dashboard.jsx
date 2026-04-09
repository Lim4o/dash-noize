import React, { useState, useMemo, useReducer, createContext, useContext, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Package, Landmark,
  TrendingUp, Settings, ChevronLeft, ChevronRight, Plus, Search,
  Calendar, TrendingDown, AlertTriangle, X, Trash2, ArrowUpRight,
  ArrowDownRight, DollarSign, BarChart3, Target, Award, Users,
  FileText, Info, PackageOpen, CreditCard, Truck, ChevronDown, Globe, Check,
  Minus, Edit3, Clock, LogOut
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useFirestoreData } from './useFirestoreData';
import { useActionHistory, clearAllHistory } from './useActionHistory';
import PageHistorico from './PageHistorico';

// ─── Translations ───
const DICT = {
  en: {
    dashboard: 'Dashboard',
    sales: 'Sales',
    purchases: 'Purchases',
    inventory: 'Inventory',
    fixed_costs: 'Fixed Costs',
    margins_profit: 'Margins & Profit',
    settings: 'Settings',
    collapse: 'Collapse',
    revenue: 'Revenue',
    net_profit: 'Net Profit',
    avg_ticket: 'Avg Ticket',
    avg_margin: 'Avg Margin',
    items_in_stock: 'Items in Stock',
    best_channel: 'Best Channel',
    most_profitable_prod: 'Most Profitable Product',
    biggest_sale: 'Biggest Sale',
    new_sale: 'New Sale',
    new_purchase: 'New Purchase',
    sales_history: 'Sales History',
    search_placeholder: 'Search product, customer, or channel...',
    date: 'Date',
    product: 'Product',
    customer: 'Customer',
    channel: 'Channel',
    payment: 'Payment',
    discount: 'Discount',
    cost: 'Cost',
    profit: 'Profit',
    status: 'Status',
    supplier: 'Supplier',
    origin: 'Origin',
    order_date: 'Order Date',
    shipping_mode: 'Shipping Mode',
    total: 'Total',
    size: 'Size',
    quantity: 'Quantity',
    avg_cost: 'Avg Cost',
    add_product: 'Add Product',
    cost_name: 'Cost Name',
    total_paid: 'Total Paid',
    cost_per_unit: 'Cost per Unit',
    margin_by_sale: 'Margin per Sale',
    margin_by_product: 'Margin per Product',
    margin_by_channel: 'Margin per Channel',
    user_profile: 'User Profile',
    name: 'Name',
    store_name: 'Store Name',
    notifications: 'Notifications',
    email_alerts: 'Email alerts',
    email_alerts_desc: 'Receive weekly reports by email',
    low_stock: 'Low stock alert',
    low_stock_desc: 'Notify when a product has fewer than 3 units',
    dark_theme: 'Dark theme',
    dark_theme_desc: 'Always use dark mode',
    danger_zone: 'Danger Zone',
    danger_zone_desc: 'The actions below are irreversible.',
    clear_sales: 'Clear all sales',
    reset_inventory: 'Reset inventory',
    active_payments: 'Active Payment Methods',
    payment_desc: 'Only active methods appear as options when recording a sale.',
    about: 'About Noize',
    export_json: 'Export data (JSON)',
    export_csv: 'Export report (CSV)',
    financial_settings: 'Financial Settings',
    exchange_rate: 'Exchange Rate (¥ → $)',
    min_margin_alert: 'Min. Margin Alert (%)',
    default_currency: 'Default Currency',
    platform_fees: 'Platform Fees',
    platform_fees_desc: 'Used to estimate net profit per channel.',
    amazon_fee: 'Amazon Referral Fee (%)',
    amazon_fee_desc: 'Avg. 15% for apparel',
    paypal_fee: 'PayPal Transaction Fee (%)',
    paypal_fee_desc: 'Standard: 3.49% + $0.49',
    active_channels: 'Active Sales Channels',
    channels_desc: 'Only active channels appear as options when recording a sale.',
    save_settings: 'Save settings',
    saved: '✓ Saved!',
    type: 'Type',
    sell_inventory: 'Sell from inventory',
    custom_order: 'Custom order',
    select: 'Select...',
    units: 'units',
    product_name: 'Product name',
    customer_optional: 'Customer (optional)',
    original_price: 'Original Price',
    final_price: 'Final price',
    notes: 'Notes',
    cancel: 'Cancel',
    record_sale: 'Record Sale',
    shipping: 'Shipping',
    remittance_fee: 'Remittance Fee',
    order_items: 'Order Items',
    add_item: 'Add Item',
    order_total: 'Order total',
    save_purchase: 'Save Purchase',
    add_cost: 'Add Cost',
    qty_purchased: 'Quantity Purchased',
    language: 'Language',
    english: 'English',
    portuguese: 'Portuguese',
    recent_sales: 'Recent Sales',
    sales_by_channel: 'Sales by Channel',
    no_sales: 'No sales recorded yet.',
    start_selling: 'Record your first sale to see metrics.',
    no_purchases: 'No purchases recorded.',
    record_purchase: 'Record an order to track inventory.',
    stock_empty: 'Inventory is empty.',
    add_purchase_prompt: 'Add a purchase to automatically feed inventory.',
    no_fixed_costs: 'No fixed costs.',
    add_cost_prompt: 'Add packaging and branding costs to calculate CPPU.',
    margin_customer: 'Margin per Customer',
    pieces_avail: 'pieces available',
    payment_methods: 'Payment Methods',
    recent_activity: 'Recent Activity',
    most_profitable_teams: 'Most Profitable Teams',
    attention: 'Attention',
    vs_prev_month: 'vs prev month',
    april_2026: 'April 2026',
    total_available: 'Total Available',
    pieces: 'pieces',
    inventory_value: 'Inventory Value',
    search_products: 'Search for product, size...',
    show_zero_balance: 'Show zero balance',
    qty: 'Qty',
    amount: 'Amount',
    actions: 'Actions',
    sales: 'Sales',
    total_value: 'Total Value',
    about_desc: 'Advanced local dashboard for managing inventory and global sales.',
    margin_estimate: 'Estimated margin — may change with new stock or sales.',
    new_product: 'New Product',
    add_to_stock: 'Add to Stock',
    edit_qty: 'Edit Quantity',
    stock_updated: 'Stock updated!',
    unique_products: 'Unique Products',
    history: 'History',
    logout: 'Logout'
  },
  pt: {
    dashboard: 'Visão Geral',
    sales: 'Vendas',
    purchases: 'Compras',
    inventory: 'Estoque',
    fixed_costs: 'Custos Fixos',
    margins_profit: 'Margens & Lucro',
    settings: 'Configurações',
    collapse: 'Recolher',
    revenue: 'Faturamento',
    net_profit: 'Lucro Líquido',
    avg_ticket: 'Ticket Médio',
    avg_margin: 'Margem Média',
    items_in_stock: 'Itens em Estoque',
    best_channel: 'Melhor Canal',
    most_profitable_prod: 'Produto +Lucrativo',
    biggest_sale: 'Maior Venda',
    new_sale: 'Nova Venda',
    new_purchase: 'Nova Compra',
    sales_history: 'Histórico de Vendas',
    search_placeholder: 'Pesquisar produto, cliente ou canal...',
    date: 'Data',
    product: 'Produto',
    customer: 'Cliente',
    channel: 'Canal',
    payment: 'Pagto',
    discount: 'Desconto',
    cost: 'Custo',
    profit: 'Lucro',
    status: 'Status',
    supplier: 'Fornecedor',
    origin: 'Origem',
    order_date: 'Data do Pedido',
    shipping_mode: 'Modo de Envio',
    total: 'Total',
    size: 'Tamanho',
    quantity: 'Qtd',
    avg_cost: 'Custo Médio',
    add_product: 'Adicionar Produto',
    cost_name: 'Nome do Custo',
    total_paid: 'Total Pago',
    cost_per_unit: 'Custo Fixo p/ Unidade (CFPU)',
    margin_by_sale: 'Margem por Venda',
    margin_by_product: 'Margem por Produto',
    margin_by_channel: 'Margem por Canal',
    user_profile: 'Perfil do Usuário',
    name: 'Nome',
    store_name: 'Nome da Loja',
    notifications: 'Notificações',
    email_alerts: 'Alertas por e-mail',
    email_alerts_desc: 'Receba relatórios semanais por e-mail',
    low_stock: 'Alerta de estoque baixo',
    low_stock_desc: 'Avisa quando produto tem menos de 3 unidades',
    dark_theme: 'Tema escuro',
    dark_theme_desc: 'Interface sempre em modo escuro',
    danger_zone: 'Zona de Perigo',
    danger_zone_desc: 'As ações abaixo são irreversíveis. Tenha certeza antes de prosseguir.',
    clear_sales: 'Limpar todas as vendas',
    reset_inventory: 'Resetar estoque',
    active_payments: 'Métodos de Pagamento Ativos',
    payment_desc: 'Apenas os ativos aparecerão como opções ao registrar venda.',
    about: 'Sobre o Noize',
    export_json: 'Exportar dados (JSON)',
    export_csv: 'Exportar relatório (CSV)',
    financial_settings: 'Configurações Financeiras',
    exchange_rate: 'Taxa de Câmbio (¥ → $)',
    min_margin_alert: 'Alerta de Margem Mín. (%)',
    default_currency: 'Moeda Padrão',
    platform_fees: 'Taxas das Plataformas',
    platform_fees_desc: 'Usado para estimar o lucro líquido por canal.',
    amazon_fee: 'Taxa Amazon (%)',
    amazon_fee_desc: 'Média de 15% para vestuário',
    paypal_fee: 'Taxa PayPal (%)',
    paypal_fee_desc: 'Padrão: 3.49% + $0.49',
    active_channels: 'Canais de Venda Ativos',
    channels_desc: 'Apenas canais ativos aparecerão ao registrar.',
    save_settings: 'Salvar configurações',
    saved: '✓ Salvo!',
    type: 'Tipo',
    sell_inventory: 'Vender do estoque',
    custom_order: 'Venda por encomenda',
    select: 'Selecione...',
    units: 'unidades',
    product_name: 'Nome do produto',
    customer_optional: 'Cliente (opcional)',
    original_price: 'Preço Original',
    final_price: 'Preço final',
    notes: 'Observações',
    cancel: 'Cancelar',
    record_sale: 'Registrar Venda',
    shipping: 'Frete',
    remittance_fee: 'Taxa Remessa',
    order_items: 'Itens do Pedido',
    add_item: 'Adicionar Item',
    order_total: 'Total do pedido',
    save_purchase: 'Salvar Compra',
    add_cost: 'Adicionar Custo',
    qty_purchased: 'Quantidade Comprada',
    language: 'Idioma',
    english: 'Inglês',
    portuguese: 'Português',
    recent_sales: 'Vendas Recentes',
    sales_by_channel: 'Vendas por Canal',
    no_sales: 'Nenhuma venda registrada ainda.',
    start_selling: 'Registre sua primeira venda para ver métricas.',
    no_purchases: 'Nenhuma compra registrada.',
    record_purchase: 'Registre um pedido para ver o estoque.',
    stock_empty: 'Estoque vazio.',
    add_purchase_prompt: 'Adicione uma compra para alimentar o estoque.',
    no_fixed_costs: 'Nenhum custo fixo.',
    add_cost_prompt: 'Adicione custos de embalagem para o CFPU.',
    margin_customer: 'Margem por Cliente',
    pieces_avail: 'peças disponíveis',
    payment_methods: 'Métodos de Pagamento',
    recent_activity: 'Atividade Recente',
    most_profitable_teams: 'Times Mais Lucrativos',
    attention: 'Atenção',
    vs_prev_month: 'vs mês anterior',
    april_2026: 'Abril 2026',
    total_available: 'Total Disponível',
    pieces: 'peças',
    inventory_value: 'Valor em Estoque',
    search_products: 'Buscar por produto, tamanho...',
    show_zero_balance: 'Mostrar saldo zero',
    qty: 'Qtd',
    amount: 'Valor',
    actions: 'Ações',
    sales: 'Vendas',
    total_value: 'Valor Total',
    about_desc: 'Painel local avançado para gerenciar estoque e vendas globais.',
    margin_estimate: 'Margem estimada — pode mudar com novas compras ou vendas.',
    new_product: 'Novo Produto',
    add_to_stock: 'Adicionar ao Estoque',
    edit_qty: 'Editar Quantidade',
    stock_updated: 'Estoque atualizado!',
    unique_products: 'Produtos Únicos',
    history: 'Histórico',
    logout: 'Sair'
  }
};

export const I18nContext = createContext();
export const useI18n = () => useContext(I18nContext);

// ─── Helpers ───
const fmt = (v) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const fmtPct = (v) => `${v.toFixed(1)}%`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US');

// â”€â”€â”€ Initial Mock Data â”€â”€â”€
const CHANNELS = ['Amazon', 'Marketplace', 'Instagram', 'TikTok Shop', 'Website'];
const PAYMENTS = ['Credit Card', 'PayPal', 'Venmo', 'Cash', 'Zelle', 'Apple Pay'];
const STATUSES_COMPRA = ['Comprado', 'A Caminho', 'Chegou'];

const initialState = {
  vendas: [],
  compras: [],
  estoque: [],
  custosFixos: [],
  clientes: [],
  fornecedores: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_VENDA': return { ...state, vendas: [...state.vendas, { ...action.payload, id: Date.now() }] };
    case 'ADD_COMPRA': return { ...state, compras: [...state.compras, { ...action.payload, id: Date.now() }] };
    case 'ADD_CUSTO': return { ...state, custosFixos: [...state.custosFixos, { ...action.payload, id: Date.now() }] };
    case 'DEL_VENDA': return { ...state, vendas: state.vendas.filter(v => v.id !== action.id) };
    case 'DEL_COMPRA': return { ...state, compras: state.compras.filter(c => c.id !== action.id) };
    case 'DEL_CUSTO': return { ...state, custosFixos: state.custosFixos.filter(c => c.id !== action.id) };
    case 'UPDATE_COMPRA_STATUS': return { ...state, compras: state.compras.map(c => c.id === action.id ? { ...c, status: action.status } : c) };
    case 'ADD_ESTOQUE': return { ...state, estoque: [...state.estoque, { ...action.payload, id: Date.now() }] };
    case 'DEL_ESTOQUE': return { ...state, estoque: state.estoque.filter(e => e.id !== action.id) };
    case 'UPDATE_ESTOQUE_QTD': return { ...state, estoque: state.estoque.map(e => e.id === action.id ? { ...e, quantidade: Math.max(0, action.quantidade) } : e) };
    case 'RESET_VENDAS': return { ...state, vendas: [] };
    case 'RESET_ESTOQUE': return { ...state, estoque: [], compras: [] };
    case 'RESET_ALL': return { ...state, vendas: [], compras: [], estoque: [], custosFixos: [], clientes: [], fornecedores: [] };
    case 'ADD_CLIENTE': return { ...state, clientes: [...(state.clientes||[]), { ...action.payload, id: Date.now() }] };
    case 'DEL_CLIENTE': return { ...state, clientes: (state.clientes||[]).filter(c => c.id !== action.id) };
    case 'ADD_FORNECEDOR': return { ...state, fornecedores: [...(state.fornecedores||[]), { ...action.payload, id: Date.now() }] };
    case 'DEL_FORNECEDOR': return { ...state, fornecedores: (state.fornecedores||[]).filter(f => f.id !== action.id) };
    case 'LOAD_STATE': return { ...state, ...action.payload };
    default: return state;
  }
}

// â”€â”€â”€ Chart tooltip â”€â”€â”€
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => <div key={i} className="value">{p.name}: {fmt(p.value)}</div>)}
    </div>
  );
};

const COLORS = ['#7c3aed', '#f97316', '#10b981', '#f59e0b', '#ef4444'];

// â”€â”€â”€ Empty State â”€â”€â”€
const EmptyState = ({ title, desc, action, onAction }) => (
  <div className="empty-state">
    <PackageOpen className="empty-icon" />
    <h4>{title}</h4>
    <p>{desc}</p>
    {action && <button className="btn btn-primary" onClick={onAction}><Plus size={14}/> {action}</button>}
  </div>
);

// â”€â”€â”€ Modal Wrapper â”€â”€â”€
const Modal = ({ title, onClose, children, footer }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ──────────────────────────────────────────────────────────────────────────
function loadPersistedState(initial) {
  try {
    const saved = localStorage.getItem('noize_financial_data');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Could not load local storage", e);
  }
  return initial;
}

export default function Dashboard() {
  const [lang, setLang] = useState('pt');
  const t = (key) => DICT[lang][key] || key;
  const { user, signOut } = useAuth();

  const [state, rawDispatch] = useReducer(reducer, initialState, loadPersistedState);
  
  // Custom hook that logs actions to Firestore
  const dispatch = useActionHistory(user, rawDispatch, lang);
  
  // Custom hook that handles syncing the state to Firestore
  useFirestoreData(user, state, dispatch);

  // Still keep local storage as fallback/offline mode
  useEffect(() => {
    localStorage.setItem('noize_financial_data', JSON.stringify(state));
  }, [state]);
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [modal, setModal] = useState(null);

  // Computed metrics
  const custoFixoPorUnidade = useMemo(() => {
    const total = state.custosFixos.reduce((s, c) => s + (c.valorTotal / c.quantidade), 0);
    return total;
  }, [state.custosFixos]);

  const metrics = useMemo(() => {
    // Total numbers
    const fat = state.vendas.reduce((s, v) => s + v.valorFinal, 0);
    const custos = state.vendas.reduce((s, v) => s + v.custoUnitario + custoFixoPorUnidade, 0);
    const lucro = fat - custos;
    const margem = fat > 0 ? (lucro / fat) * 100 : 0;
    
    const totalEstoque = state.estoque.reduce((s, e) => s + e.quantidade, 0);
    const valorEstoque = state.estoque.reduce((s, e) => s + (e.quantidade * e.custoMedio), 0);
    const ticketMedio = state.vendas.length > 0 ? fat / state.vendas.length : 0;
    
    // Month over Month (MoM) calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    let fatAtual = 0, fatAnterior = 0;
    let custosAtual = 0, custosAnterior = 0;

    state.vendas.forEach(v => {
      // Create a date from the string YYYY-MM-DD
      const [y, mStr] = (v.data || '').split('-');
      if (!y || !mStr) return;
      
      const vY = parseInt(y, 10);
      const vM = parseInt(mStr, 10) - 1; // 0-indexed month
      
      if (vM === currentMonth && vY === currentYear) {
        fatAtual += v.valorFinal;
        custosAtual += v.custoUnitario + custoFixoPorUnidade;
      } else if (vM === prevMonth && vY === prevYear) {
        fatAnterior += v.valorFinal;
        custosAnterior += v.custoUnitario + custoFixoPorUnidade;
      }
    });

    const lucroAtual = fatAtual - custosAtual;
    const margemAtual = fatAtual > 0 ? (lucroAtual / fatAtual) * 100 : 0;
    const lucroAnterior = fatAnterior - custosAnterior;
    const margemAnterior = fatAnterior > 0 ? (lucroAnterior / fatAnterior) * 100 : 0;

    const calcChange = (atual, ant) => {
      if (ant === 0) {
        if (atual > 0) return { val: 100, type: 'positive', hasData: true };
        if (atual < 0) return { val: -100, type: 'negative', hasData: true };
        return { val: 0, type: 'neutral', hasData: false }; // no previous and no current
      }
      const pct = ((atual - ant) / Math.abs(ant)) * 100;
      return { val: pct, type: pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral', hasData: true };
    };

    const fatChange = calcChange(fatAtual, fatAnterior);
    const lucroChange = calcChange(lucroAtual, lucroAnterior);
    const margemChange = {
      val: margemAtual - margemAnterior,
      type: (margemAtual - margemAnterior) > 0 ? 'positive' : (margemAtual - margemAnterior) < 0 ? 'negative' : 'neutral',
      hasData: fatAnterior > 0 || fatAtual > 0
    };

    const canalCount = {};
    state.vendas.forEach(v => { canalCount[v.canal] = (canalCount[v.canal] || 0) + 1; });
    const melhorCanal = Object.entries(canalCount).sort((a, b) => b[1] - a[1])[0];
    
    const prodLucro = {};
    state.vendas.forEach(v => { prodLucro[v.produto] = (prodLucro[v.produto] || 0) + (v.valorFinal - v.custoUnitario - custoFixoPorUnidade); });
    const melhorProduto = Object.entries(prodLucro).sort((a, b) => b[1] - a[1])[0];
    
    const melhorVenda = [...state.vendas].sort((a, b) => b.valorFinal - a.valorFinal)[0];
    
    return { fat, lucro, margem, totalEstoque, valorEstoque, ticketMedio, melhorCanal, melhorProduto, melhorVenda, fatChange, lucroChange, margemChange };
  }, [state.vendas, state.estoque, custoFixoPorUnidade]);

  const chartDataVendas = useMemo(() => {
    const map = {};
    state.vendas.forEach(v => {
      const d = fmtDate(v.data);
      map[d] = (map[d] || 0) + v.valorFinal;
    });
    return Object.entries(map).map(([d, v]) => ({ data: d, vendas: v })).sort((a, b) => a.data.localeCompare(b.data));
  }, [state.vendas]);

  const chartDataPagamento = useMemo(() => {
    const map = {};
    state.vendas.forEach(v => { map[v.pagamento] = (map[v.pagamento] || 0) + v.valorFinal; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [state.vendas]);

  const NAV = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'vendas', label: t('sales'), icon: ShoppingBag },
    { id: 'compras', label: t('purchases'), icon: ShoppingCart },
    { id: 'estoque', label: t('inventory'), icon: Package },
    { id: 'custos', label: t('fixed_costs'), icon: Landmark },
    { id: 'margens', label: t('margins_profit'), icon: TrendingUp },
    { id: 'historico', label: t('history'), icon: Clock },
    { id: 'cadastros', label: lang === 'pt' ? 'Cadastros' : 'Contacts', icon: Users },
  ];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">N</div>
          <span className="logo-text">Noize</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <div key={n.id} className={`sidebar-nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon"><n.icon size={18}/></span>
              <span className="nav-label">{n.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-nav-item" onClick={() => setPage('config')}>
            <span className="nav-icon"><Settings size={18}/></span>
            <span className="nav-label">{t('settings')}</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={16}/> : <><ChevronLeft size={16}/><span className="nav-label" style={{marginLeft:6}}>{t('collapse')}</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h1 className="header-title">{NAV.find(n => n.id === page)?.label || t('settings')}</h1>
          </div>
          <div className="header-right">
            <div className="period-selector"><Calendar size={14}/> {t('april_2026')} <ChevronDown size={12}/></div>
            <div className="user-avatar" title={user?.email || 'Guest'}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User avatar" style={{ width: 32, height: 32, borderRadius: 16 }} />
              ) : (
                <div className="avatar-circle">{user?.email?.substring(0,2).toUpperCase() || 'UN'}</div>
              )}
              <span className="avatar-name">{user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário'}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={signOut} title={t('logout')}>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-fade" key={page}>
            {page === 'dashboard' && <PageDashboard metrics={metrics} state={state} dispatch={dispatch} setModal={setModal} chartDataVendas={chartDataVendas} chartDataPagamento={chartDataPagamento} custoFixoPorUnidade={custoFixoPorUnidade} />}
            {page === 'vendas' && <PageVendas state={state} dispatch={dispatch} setModal={setModal} custoFixoPorUnidade={custoFixoPorUnidade} />}
            {page === 'compras' && <PageCompras state={state} dispatch={dispatch} setModal={setModal} />}
            {page === 'estoque' && <PageEstoque state={state} dispatch={dispatch} setModal={setModal} />}
            {page === 'custos' && <PageCustos state={state} dispatch={dispatch} setModal={setModal} />}
            {page === 'margens' && <PageMargens state={state} custoFixoPorUnidade={custoFixoPorUnidade} />}
            {page === 'historico' && <PageHistorico t={t} />}
            {page === 'cadastros' && <PageCadastros state={state} dispatch={dispatch} setModal={setModal} />}
            {page === 'config' && <PageConfig dispatch={dispatch} user={user} />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'venda' && <ModalVenda state={state} dispatch={dispatch} user={user} onClose={() => setModal(null)} />}
      {modal === 'compra' && <ModalCompra state={state} dispatch={dispatch} onClose={() => setModal(null)} />}
      {modal === 'custo' && <ModalCusto dispatch={dispatch} onClose={() => setModal(null)} />}
      {modal === 'estoque' && <ModalEstoque dispatch={dispatch} onClose={() => setModal(null)} />}
      {(modal === 'cadastro-cliente' || modal === 'cadastro-fornecedor') && (
        <ModalCadastro tipoInicial={modal === 'cadastro-fornecedor' ? 'fornecedor' : 'cliente'} dispatch={dispatch} onClose={() => setModal(null)} />
      )}
    </div>
    </I18nContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE: DASHBOARD
// ──────────────────────────────────────────────────────────────────────────
function TrendIndicator({ metric, isMargin = false, t }) {
  if (!metric || !metric.hasData) return null;
  const icon = metric.type === 'positive' ? <ArrowUpRight size={14}/> : metric.type === 'negative' ? <ArrowDownRight size={14}/> : null;
  const sign = metric.val > 0 ? '+' : '';
  const suffix = isMargin ? 'pp' : `% ${t('vs_prev_month')}`;
  return (
    <span className={`metric-change ${metric.type}`}>
      {icon} {sign}{metric.val.toFixed(1)}{suffix}
    </span>
  );
}

function PageDashboard({ metrics, state, dispatch, setModal, chartDataVendas, chartDataPagamento, custoFixoPorUnidade }) {
  const { t } = useI18n();

  const timesLucrativos = useMemo(() => {
    const m = {};
    state.vendas.forEach(v => {
      const lucro = v.valorFinal - v.custoUnitario - custoFixoPorUnidade;
      m[v.produto] = (m[v.produto] || 0) + lucro;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [state.vendas, custoFixoPorUnidade]);

  return (
    <>
      <div className="action-row">
        <button className="btn btn-primary" onClick={() => setModal('venda')}><Plus size={14}/> {t('new_sale')}</button>
        <button className="btn btn-secondary" onClick={() => setModal('compra')}><Plus size={14}/> {t('new_purchase')}</button>
      </div>

      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-label">{t('revenue')}</span>
            <div className="metric-icon" style={{background:'rgba(124,58,237,0.15)'}}><TrendingUp size={16} color="#7c3aed"/></div>
          </div>
          <span className="metric-value">{fmt(metrics.fat)}</span>
          <TrendIndicator metric={metrics.fatChange} t={t} />
        </div>
        <div className="card card-highlight metric-card">
          <div className="metric-header">
            <span className="metric-label">{t('net_profit')}</span>
            <div className="metric-icon" style={{background:'rgba(249,115,22,0.15)'}}><DollarSign size={16} color="#f97316"/></div>
          </div>
          <span className="metric-value" style={{color:'#f97316'}}>{fmt(metrics.lucro)}</span>
          <TrendIndicator metric={metrics.lucroChange} t={t} />
        </div>
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-label">{t('avg_margin')}</span>
            {metrics.margem < 10 && <span className="badge badge-warning">{t('attention')}</span>}
          </div>
          <span className="metric-value">{fmtPct(metrics.margem)}</span>
          <TrendIndicator metric={metrics.margemChange} isMargin={true} t={t} />
        </div>
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-label">{t('items_in_stock')}</span>
            <div className="metric-icon" style={{background:'rgba(16,185,129,0.15)'}}><Package size={16} color="#10b981"/></div>
          </div>
          <span className="metric-value">{metrics.totalEstoque}</span>
          <span className="metric-change" style={{color:'var(--text-muted)'}}>{t('pieces_avail')}</span>
        </div>
      </div>

      <div className="secondary-grid">
        <div className="card secondary-card">
          <div className="sec-label">{t('biggest_sale')}</div>
          <div className="sec-value">{metrics.melhorVenda ? fmt(metrics.melhorVenda.valorFinal) : '—'}</div>
          <div className="sec-sub">{metrics.melhorVenda?.produto || ''}</div>
        </div>
        <div className="card secondary-card">
          <div className="sec-label">{t('avg_ticket')}</div>
          <div className="sec-value">{fmt(metrics.ticketMedio)}</div>
        </div>
        <div className="card secondary-card">
          <div className="sec-label">{t('best_channel')}</div>
          <div className="sec-value">{metrics.melhorCanal?.[0] || '—'}</div>
          <div className="sec-sub">{metrics.melhorCanal ? `${metrics.melhorCanal[1]} sales` : ''}</div>
        </div>
        <div className="card secondary-card">
          <div className="sec-label">{t('most_profitable_prod')}</div>
          <div className="sec-value">{metrics.melhorProduto?.[0] || '—'}</div>
          <div className="sec-sub">{metrics.melhorProduto ? fmt(metrics.melhorProduto[1]) + ' profit' : ''}</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="card chart-card">
          <div className="chart-title">{t('recent_sales')}</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartDataVendas}>
              <defs>
                <linearGradient id="gVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="data" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Area type="monotone" dataKey="vendas" stroke="#7c3aed" strokeWidth={2} fill="url(#gVendas)" name={t('sales')}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <div className="chart-title">{t('payment_methods')}</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartDataPagamento} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
                {chartDataPagamento.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Pie>
              <Tooltip content={<ChartTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginTop:8}}>
            {chartDataPagamento.map((d,i) => (
              <span key={i} style={{fontSize:11,color:'#9ca3af',display:'flex',alignItems:'center',gap:4}}>
                <span style={{width:8,height:8,borderRadius:2,background:COLORS[i%COLORS.length]}}></span>{d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="card chart-card">
          <div className="chart-title">{t('recent_activity')}</div>
          {state.vendas.length === 0 ? (
            <EmptyState title={t('no_activities')} desc={t('no_activities_desc')}/>
          ) : (
            <div className="activity-list">
              {state.vendas.slice(-5).reverse().map(v => (
                <div key={v.id} className="activity-item">
                  <div className="act-icon" style={{background:'rgba(16,185,129,0.1)'}}><ArrowUpRight size={16} color="#10b981"/></div>
                  <div className="act-info">
                    <div className="act-title">{v.produto}</div>
                    <div className="act-sub">{fmtDate(v.data)} · {v.canal} · {v.pagamento}</div>
                  </div>
                  <div className="act-amount income">+{fmt(v.valorFinal)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card chart-card">
          <div className="chart-title">{t('most_profitable_teams')}</div>
          <div className="ranking-list">
            {timesLucrativos.map(([nome, lucro], i) => (
              <div key={nome} className="ranking-item">
                <span className="ranking-pos">#{i + 1}</span>
                <span className="ranking-name">{nome}</span>
                <span className="ranking-value">{fmt(lucro)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE: VENDAS
// ──────────────────────────────────────────────────────────────────────────
function PageVendas({ state, dispatch, setModal, custoFixoPorUnidade }) {
  const { t } = useI18n();
  const [filterCanal, setFilterCanal] = useState('All');
  
  return (
    <>
      <div className="action-row" style={{justifyContent:'space-between'}}>
        <div className="filters-row" style={{marginBottom:0}}>
          {['All', ...CHANNELS].map(c => (
            <button key={c} className={`filter-chip ${filterCanal === c ? 'active' : ''}`} onClick={() => setFilterCanal(c)}>{c === 'All' ? t('all') : c}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setModal('venda')}><Plus size={14}/> {t('new_sale')}</button>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {state.vendas.length === 0 ? (
          <EmptyState title={t('no_activities')} desc={t('no_activities_desc')} action={t('new_sale')} onAction={() => setModal('venda')}/>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>{t('date')}</th><th>{t('product')}</th><th>{t('channel')}</th><th>{t('amount')}</th><th>{t('payment')}</th><th>{t('profit')}</th><th>{t('margin')}</th><th>Vendedor</th><th>{t('actions')}</th></tr></thead>
              <tbody>
                {state.vendas.filter(v => filterCanal === 'All' || v.canal === filterCanal).map(v => {
                  const lucro = v.valorFinal - v.custoUnitario - custoFixoPorUnidade;
                  const margem = v.valorFinal > 0 ? (lucro / v.valorFinal) * 100 : 0;
                  return (
                    <tr key={v.id}>
                      <td>{fmtDate(v.data)}</td>
                      <td style={{color:'#fff',fontWeight:500}}>{v.produto}</td>
                      <td><span className="badge badge-purple">{v.canal}</span></td>
                      <td style={{fontWeight:600}}>{fmt(v.valorFinal)}</td>
                      <td>{v.pagamento}</td>
                      <td style={{color: lucro >= 0 ? '#10b981' : '#ef4444', fontWeight:600}}>{fmt(lucro)}</td>
                      <td><span className={`badge ${margem >= 20 ? 'badge-success' : margem >= 10 ? 'badge-warning' : 'badge-danger'}`}>{fmtPct(margem)}</span></td>
                      <td style={{fontSize:12, color:'var(--text-muted)'}}>{v.vendedor || '—'}</td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => dispatch({type:'DEL_VENDA',id:v.id})}><Trash2 size={13}/></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// STATUS DROPDOWN
// ──────────────────────────────────────────────────────────────────────────
function StatusDropdown({ compraId, currentStatus, dispatch }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const statusConfig = {
    'Comprado': { badge: 'badge-purple', icon: CreditCard, color: '#8b5cf6', nextLabel: 'A Caminho' },
    'A Caminho': { badge: 'badge-warning', icon: Truck, color: '#f59e0b', nextLabel: 'Chegou' },
    'Chegou':   { badge: 'badge-success', icon: Check, color: '#10b981', nextLabel: null },
  };

  const cfg = statusConfig[currentStatus] || statusConfig['Comprado'];
  const StatusIcon = cfg.icon;

  const handleStatusChange = (newStatus) => {
    dispatch({ type: 'UPDATE_COMPRA_STATUS', id: compraId, status: newStatus });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={`badge ${cfg.badge}`}
        onClick={() => setOpen(!open)}
        style={{
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          border: 'none', padding: '4px 10px', fontSize: 12, fontWeight: 600,
          transition: 'all 200ms ease', borderRadius: 6,
        }}
        title="Clique para alterar o status"
      >
        <StatusIcon size={12} />
        {currentStatus}
        <ChevronDown size={10} style={{ marginLeft: 2, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
          background: 'var(--bg-primary)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 6, minWidth: 180,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
          animation: 'fadeIn 150ms ease',
        }}>
          <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 2 }}>Alterar Status</div>
          {STATUSES_COMPRA.map(s => {
            const sc = statusConfig[s];
            const Icon = sc.icon;
            const isActive = s === currentStatus;
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '8px 10px', border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif',
                  background: isActive ? `${sc.color}15` : 'transparent',
                  color: isActive ? sc.color : 'var(--text-secondary)',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { if (!isActive) { e.target.style.background = 'var(--bg-secondary)'; } }}
                onMouseLeave={e => { if (!isActive) { e.target.style.background = 'transparent'; } }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${sc.color}20`,
                }}>
                  <Icon size={13} color={sc.color} />
                </div>
                <span style={{ flex: 1, textAlign: 'left' }}>{s}</span>
                {isActive && <Check size={14} color={sc.color} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE: COMPRAS
// ──────────────────────────────────────────────────────────────────────────
function PageCompras({ state, dispatch, setModal }) {
  const { t } = useI18n();
  const [filterStatus, setFilterStatus] = useState('All');
  const filtered = state.compras.filter(c => filterStatus === 'All' || c.status === filterStatus);
  return (
    <>
      <div className="action-row" style={{justifyContent:'space-between'}}>
        <div className="filters-row" style={{marginBottom:0}}>
          {['All', ...STATUSES_COMPRA].map(s => (
            <button key={s} className={`filter-chip ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s === 'All' ? t('all') : s}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setModal('compra')}><Plus size={14}/> {t('new_purchase')}</button>
      </div>
      {filtered.length === 0 ? (
        <div className="card"><EmptyState title={t('no_activities')} desc={t('no_activities_desc')} action={t('new_purchase')} onAction={() => setModal('compra')}/></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {filtered.map(c => {
            const totalItens = c.itens.reduce((s, it) => s + (it.custoReal * it.quantidade), 0);
            return (
              <div key={c.id} className="card" style={{padding:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:15,marginBottom:4}}>{c.fornecedor}</div>
                    <div style={{fontSize:12,color:'var(--text-muted)'}}>{fmtDate(c.dataPedido)} · {c.origem} · {c.modoEnvio}</div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <StatusDropdown compraId={c.id} currentStatus={c.status} dispatch={dispatch} />
                    <button className="btn btn-ghost btn-sm" onClick={() => dispatch({type:'DEL_COMPRA',id:c.id})}><Trash2 size={13}/></button>
                  </div>
                </div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>{t('product')}</th><th>{t('size')}</th><th>{t('qty')}</th><th>{t('amount')}</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {c.itens.map((it, i) => (
                        <tr key={i}><td style={{color:'#fff'}}>{it.nome}</td><td>{it.tamanho}</td><td>{it.quantidade}</td><td>{fmt(it.custoReal)}</td><td style={{fontWeight:600}}>{fmt(it.custoReal * it.quantidade)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{display:'flex',gap:16,marginTop:12,fontSize:12,color:'var(--text-secondary)',justifyContent:'flex-end'}}>
                  <span>Frete: {fmt(c.frete)}</span>
                  {c.taxaRemessa > 0 && <span>Taxa: {fmt(c.taxaRemessa)}</span>}
                  <span style={{fontWeight:700,color:'#fff'}}>Total: {fmt(totalItens + c.frete + c.taxaRemessa)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE: ESTOQUE
// ──────────────────────────────────────────────────────────────────────────
function PageEstoque({ state, dispatch, setModal }) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [showZero, setShowZero] = useState(false);
  const totalPecas = state.estoque.reduce((s, e) => s + e.quantidade, 0);
  const valorTotal = state.estoque.reduce((s, e) => s + e.quantidade * e.custoMedio, 0);
  const filtered = state.estoque.filter(e => (showZero || e.quantidade > 0) && (e.produto.toLowerCase().includes(search.toLowerCase()) || e.tamanho.toLowerCase().includes(search.toLowerCase())));
  return (
    <>
      <div className="action-row" style={{justifyContent:'space-between'}}>
        <div className="summary-cards" style={{marginBottom:0,flex:1}}>
          <div className="card" style={{padding:16}}><div className="sec-label">{t('total_available')}</div><div className="sec-value" style={{fontSize:22}}>{totalPecas} {t('pieces')}</div></div>
          <div className="card" style={{padding:16}}><div className="sec-label">{t('inventory_value')}</div><div className="sec-value" style={{fontSize:22}}>{fmt(valorTotal)}</div></div>
          <div className="card" style={{padding:16}}><div className="sec-label">{t('unique_products')}</div><div className="sec-value" style={{fontSize:22}}>{state.estoque.length}</div></div>
        </div>
      </div>
      <div style={{display:'flex',gap:16,marginBottom:20,alignItems:'center',flexWrap:'wrap'}}>
        <div className="search-bar" style={{flex:1}}>
          <Search size={14} className="search-icon"/>
          <input placeholder={t('search_products')} value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="toggle-wrapper" onClick={() => setShowZero(!showZero)}>
          <div className={`toggle-track ${showZero ? 'on' : ''}`}><div className="toggle-thumb"/></div>
          {t('show_zero_balance')}
        </div>
        <button className="btn btn-primary" onClick={() => setModal('estoque')}><Plus size={14}/> {t('new_product')}</button>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {filtered.length === 0 ? (
          <EmptyState title={t('stock_empty')} desc={t('add_purchase_prompt')} action={t('new_product')} onAction={() => setModal('estoque')}/>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>{t('product')}</th><th>{t('size')}</th><th>{t('qty')}</th><th>{t('avg_cost')}</th><th>{t('total_value')}</th><th>{t('actions')}</th></tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{color:'#fff',fontWeight:500}}>{e.produto}</td>
                    <td><span className="badge badge-purple">{e.tamanho}</span></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{padding:'4px 6px',minWidth:28}}
                          onClick={() => dispatch({type:'UPDATE_ESTOQUE_QTD', id:e.id, quantidade: e.quantidade - 1})}
                        >
                          <Minus size={12}/>
                        </button>
                        <span style={{fontWeight:600, color: e.quantidade === 0 ? '#ef4444' : '#fff', minWidth:24, textAlign:'center'}}>{e.quantidade}</span>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{padding:'4px 6px',minWidth:28}}
                          onClick={() => dispatch({type:'UPDATE_ESTOQUE_QTD', id:e.id, quantidade: e.quantidade + 1})}
                        >
                          <Plus size={12}/>
                        </button>
                      </div>
                    </td>
                    <td>{fmt(e.custoMedio)}</td>
                    <td style={{fontWeight:600}}>{fmt(e.quantidade * e.custoMedio)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => dispatch({type:'DEL_ESTOQUE',id:e.id})}><Trash2 size={13}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE: CUSTOS FIXOS
// ──────────────────────────────────────────────────────────────────────────
function PageCustos({ state, dispatch, setModal }) {
  const { t } = useI18n();
  return (
    <>
      <div className="action-row"><button className="btn btn-primary" onClick={() => setModal('custo')}><Plus size={14}/> {t('new_fixed_cost')}</button></div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {state.custosFixos.length === 0 ? (
          <EmptyState title={t('no_activities')} desc={t('no_activities_desc')} action={t('new_fixed_cost')} onAction={() => setModal('custo')}/>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>{t('name')}</th><th>{t('total_value')}</th><th>{t('qty')}</th><th>{t('cost_per_unit')}</th><th>{t('actions')}</th></tr></thead>
              <tbody>
                {state.custosFixos.map(c => (
                  <tr key={c.id}>
                    <td style={{color:'#fff',fontWeight:500}}>{c.nome}</td>
                    <td>{fmt(c.valorTotal)}</td>
                    <td>{c.quantidade}</td>
                    <td style={{color:'var(--purple-light)',fontWeight:600}}>{fmt(c.valorTotal / c.quantidade)}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => dispatch({type:'DEL_CUSTO',id:c.id})}><Trash2 size={13}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE: MARGENS & LUCRO
// ──────────────────────────────────────────────────────────────────────────
function PageMargens({ state, custoFixoPorUnidade }) {
  const { t } = useI18n();
  const [tab, setTab] = useState('venda');
  const fat = state.vendas.reduce((s, v) => s + v.valorFinal, 0);
  const custos = state.vendas.reduce((s, v) => s + v.custoUnitario + custoFixoPorUnidade, 0);
  const lucro = fat - custos;
  const margem = fat > 0 ? (lucro / fat) * 100 : 0;
  return (
    <>
      <div className="tabs">
        {[{id:'venda',l: 'Por Venda'},{id:'produto',l: 'Por Produto'},{id:'canal',l: 'Por Canal'},{id:'cliente',l: 'Por Cliente'}].map(t => (
          <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.l}</button>
        ))}
      </div>
      <div className="metrics-grid" style={{marginBottom:16}}>
        <div className="card metric-card"><span className="metric-label">{t('revenue')}</span><span className="metric-value" style={{fontSize:20}}>{fmt(fat)}</span></div>
        <div className="card metric-card"><span className="metric-label">{t('fixed_costs')}</span><span className="metric-value" style={{fontSize:20,color:'#ef4444'}}>{fmt(custos)}</span></div>
        <div className="card metric-card"><span className="metric-label">{t('net_profit')}</span><span className="metric-value" style={{fontSize:20,color:'#10b981'}}>{fmt(lucro)}</span></div>
        <div className="card metric-card"><span className="metric-label">{t('avg_margin')}</span><span className="metric-value" style={{fontSize:20}}>{fmtPct(margem)}</span></div>
      </div>
      <div className="banner banner-warning"><AlertTriangle size={16} color="#f59e0b"/> {t('margin_estimate')}</div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {state.vendas.length === 0 ? <EmptyState title={t('no_activities')} desc={t('no_activities_desc')}/> : (
          <div className="table-container">
            {tab === 'venda' && <TableMargemVenda vendas={state.vendas} cpfu={custoFixoPorUnidade}/>}
            {tab === 'produto' && <TableMargemProduto vendas={state.vendas} cpfu={custoFixoPorUnidade}/>}
            {tab === 'canal' && <TableMargemCanal vendas={state.vendas} cpfu={custoFixoPorUnidade}/>}
            {tab === 'cliente' && <TableMargemCliente vendas={state.vendas} cpfu={custoFixoPorUnidade}/>}
          </div>
        )}
      </div>
    </>
  );
}

function TableMargemVenda({ vendas, cpfu }) {
  const { t } = useI18n();
  return (<table><thead><tr><th>{t('date')}</th><th>{t('product')}</th><th>{t('revenue')}</th><th>{t('cost_per_unit')}</th><th>{t('profit')}</th><th>{t('margin')}</th></tr></thead><tbody>
    {vendas.map(v => { const l = v.valorFinal - v.custoUnitario - cpfu; const m = v.valorFinal > 0 ? (l/v.valorFinal)*100 : 0; return (
      <tr key={v.id}><td>{fmtDate(v.data)}</td><td style={{color:'#fff'}}>{v.produto}</td><td>{fmt(v.valorFinal)}</td><td>{fmt(v.custoUnitario + cpfu)}</td><td style={{color:l>=0?'#10b981':'#ef4444',fontWeight:600}}>{fmt(l)}</td><td><span className={`badge ${m>=20?'badge-success':m>=10?'badge-warning':'badge-danger'}`}>{fmtPct(m)}</span></td></tr>
    );})}
  </tbody></table>);
}
function TableMargemProduto({ vendas, cpfu }) {
  const { t } = useI18n();
  const m = {}; vendas.forEach(v => { if(!m[v.produto]) m[v.produto]={fat:0,custo:0,qtd:0}; m[v.produto].fat+=v.valorFinal; m[v.produto].custo+=v.custoUnitario+cpfu; m[v.produto].qtd++; });
  return (<table><thead><tr><th>{t('product')}</th><th>{t('sales')}</th><th>{t('revenue')}</th><th>{t('cost_per_unit')}</th><th>{t('profit')}</th><th>{t('margin')}</th></tr></thead><tbody>
    {Object.entries(m).map(([p,d])=>{ const l=d.fat-d.custo; const mg=d.fat>0?(l/d.fat)*100:0; return <tr key={p}><td style={{color:'#fff'}}>{p}</td><td>{d.qtd}</td><td>{fmt(d.fat)}</td><td>{fmt(d.custo)}</td><td style={{color:l>=0?'#10b981':'#ef4444',fontWeight:600}}>{fmt(l)}</td><td><span className={`badge ${mg>=20?'badge-success':mg>=10?'badge-warning':'badge-danger'}`}>{fmtPct(mg)}</span></td></tr>; })}
  </tbody></table>);
}
function TableMargemCanal({ vendas, cpfu }) {
  const { t } = useI18n();
  const m = {}; vendas.forEach(v => { if(!m[v.canal]) m[v.canal]={fat:0,custo:0,qtd:0}; m[v.canal].fat+=v.valorFinal; m[v.canal].custo+=v.custoUnitario+cpfu; m[v.canal].qtd++; });
  return (<table><thead><tr><th>{t('channel')}</th><th>{t('sales')}</th><th>{t('revenue')}</th><th>{t('cost_per_unit')}</th><th>{t('profit')}</th><th>{t('margin')}</th></tr></thead><tbody>
    {Object.entries(m).map(([p,d])=>{ const l=d.fat-d.custo; const mg=d.fat>0?(l/d.fat)*100:0; return <tr key={p}><td><span className="badge badge-purple">{p}</span></td><td>{d.qtd}</td><td>{fmt(d.fat)}</td><td>{fmt(d.custo)}</td><td style={{color:l>=0?'#10b981':'#ef4444',fontWeight:600}}>{fmt(l)}</td><td><span className={`badge ${mg>=20?'badge-success':mg>=10?'badge-warning':'badge-danger'}`}>{fmtPct(mg)}</span></td></tr>; })}
  </tbody></table>);
}
function TableMargemCliente({ vendas, cpfu }) {
  const { t } = useI18n();
  const m = {}; vendas.forEach(v => { const c=v.cliente||'Unknown'; if(!m[c]) m[c]={fat:0,custo:0,qtd:0}; m[c].fat+=v.valorFinal; m[c].custo+=v.custoUnitario+cpfu; m[c].qtd++; });
  return (<table><thead><tr><th>Cliente</th><th>{t('qty')}</th><th>{t('revenue')}</th><th>{t('cost_per_unit')}</th><th>{t('profit')}</th><th>{t('margin')}</th></tr></thead><tbody>
    {Object.entries(m).map(([p,d])=>{ const l=d.fat-d.custo; const mg=d.fat>0?(l/d.fat)*100:0; return <tr key={p}><td style={{color:'#fff'}}>{p}</td><td>{d.qtd}</td><td>{fmt(d.fat)}</td><td>{fmt(d.custo)}</td><td style={{color:l>=0?'#10b981':'#ef4444',fontWeight:600}}>{fmt(l)}</td><td><span className={`badge ${mg>=20?'badge-success':mg>=10?'badge-warning':'badge-danger'}`}>{fmtPct(mg)}</span></td></tr>; })}
  </tbody></table>);
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE: CONFIGURAÇÕES
// ──────────────────────────────────────────────────────────────────────────
function PageConfig({ dispatch, user }) {
  const { t, lang, setLang } = useI18n();
  const { updateUserAuthProfile } = useAuth();
  const [tab, setTab] = useState('perfil');
  const [saved, setSaved] = useState(false);

  // Perfil
  const [nomeUsuario, setNomeUsuario] = useState(user?.displayName || 'Usuário');
  const [email, setEmail] = useState(user?.email || 'email@exemplo.com');
  const [nomeLoja, setNomeLoja] = useState('Noize Store');
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifEstoque, setNotifEstoque] = useState(true);

  // Pagamentos — controlled object so toggles actually reflect state
  const [payments, setPayments] = useState({
    'Credit Card': true, 'PayPal': true, 'Venmo': true,
    'Zelle': true, 'Apple Pay': true, 'Cash': false,
  });

  // Taxas
  const [cambio, setCambio] = useState('0.14');
  const [margemAlerta, setMargemAlerta] = useState('10');
  const [currency, setCurrency] = useState('USD');
  const [amazonFee, setAmazonFee] = useState('15');
  const [paypalFee, setPaypalFee] = useState('3.49');

  // Canais — controlled object
  const [channels, setChannels] = useState({
    'Amazon': true, 'Marketplace': true, 'Instagram': true,
    'TikTok Shop': true, 'Website': true, 'eBay': false,
  });

  const togglePayment = (key) => setPayments(p => ({ ...p, [key]: !p[key] }));
  const toggleChannel = (key) => setChannels(c => ({ ...c, [key]: !c[key] }));

  const handleSave = async () => {
    try {
      if (updateUserAuthProfile && nomeUsuario && nomeUsuario !== user?.displayName) {
        await updateUserAuthProfile(nomeUsuario);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Erro ao salvar", e);
      alert("Ocorreu um erro ao atualizar o nome de usuário.");
    }
  };

  const CONFIG_TABS = [
    { id: 'perfil',     label: t('user_profile'),     icon: Users },
    { id: 'pagamentos', label: t('active_payments'), icon: CreditCard },
    { id: 'taxas',      label: t('financial_settings'),      icon: TrendingUp },
    { id: 'canais',     label: t('active_channels'),     icon: BarChart3 },
  ];

  return (
    <div style={{maxWidth:700}}>
      {/* Tab bar */}
      <div style={{display:'flex',gap:2,marginBottom:20,background:'var(--bg-secondary)',padding:4,borderRadius:10,width:'fit-content'}}>
        {CONFIG_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:500,fontFamily:'Inter,sans-serif',transition:'all 200ms ease',background:tab===t.id?'var(--purple-glow)':'transparent',color:tab===t.id?'var(--purple-light)':'var(--text-muted)'}}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:16}}>

        {/* ── PERFIL ── */}
        {tab === 'perfil' && <>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><Globe size={16} color="#10b981"/></div>
              <h4>{t('language')}</h4>
            </div>
            <div className="form-group">
              <select className="form-select" value={lang} onChange={e => setLang(e.target.value)}>
                <option value="en">🇺🇸 {t('english')}</option>
                <option value="pt">🇧🇷 {t('portuguese')}</option>
              </select>
            </div>
          </div>

          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:'var(--purple-glow)',display:'flex',alignItems:'center',justifyContent:'center'}}><Users size={16} color="#8b5cf6"/></div>
              <h4>{t('user_profile')}</h4>
            </div>
            <div className="form-row">
              <div className="form-group"><label>{t('name')}</label><input className="form-input" value={nomeUsuario} onChange={e=>setNomeUsuario(e.target.value)}/></div>
              <div className="form-group"><label>E-mail</label><input className="form-input" value={email} disabled style={{opacity: 0.6, cursor: 'not-allowed'}}/></div>
            </div>
            <div className="form-group" style={{marginTop:12}}>
              <label>{t('store_name')}</label>
              <input className="form-input" value={nomeLoja} onChange={e=>setNomeLoja(e.target.value)}/>
            </div>
          </div>

          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(245,158,11,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><FileText size={16} color="#f59e0b"/></div>
              <h4>{t('notifications')}</h4>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                {key:'email',label:t('email_alerts'),desc:t('email_alerts_desc'),val:notifEmail,set:setNotifEmail},
                {key:'estoque',label:t('low_stock'),desc:t('low_stock_desc'),val:notifEstoque,set:setNotifEstoque},
              ].map(n=>(
                <div key={n.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--bg-secondary)',borderRadius:8}}>
                  <div><div style={{fontSize:13,fontWeight:500}}>{n.label}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{n.desc}</div></div>
                  <div className={`toggle-track ${n.val?'on':''}`} onClick={()=>n.set(!n.val)} style={{cursor:'pointer'}}><div className="toggle-thumb"/></div>
                </div>
              ))}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--bg-secondary)',borderRadius:8}}>
                <div><div style={{fontSize:13,fontWeight:500}}>{t('dark_theme')}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{t('dark_theme_desc')}</div></div>
                <div className="toggle-track on" style={{cursor:'default'}}><div className="toggle-thumb"/></div>
              </div>
            </div>
          </div>

          <div className="card" style={{borderColor:'rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.04)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <AlertTriangle size={16} color="#ef4444"/>
              <h4 style={{color:'#ef4444'}}>{t('danger_zone')}</h4>
            </div>
            <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:14,lineHeight:1.5}}>{t('danger_zone_desc')}</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-danger btn-sm" onClick={() => { if(confirm('Tem certeza que deseja apagar todas as vendas?')) dispatch({type: 'RESET_VENDAS'}) }}><Trash2 size={13}/> {t('clear_sales')}</button>
              <button className="btn btn-danger btn-sm" onClick={() => { if(confirm('Tem certeza que deseja zerar o estoque e compras?')) dispatch({type: 'RESET_ESTOQUE'}) }}><Trash2 size={13}/> {t('reset_inventory')}</button>
              <button className="btn btn-danger btn-sm" onClick={async () => { if(confirm('Tem certeza que deseja apagar TODOS os dados (Vendas, Compras, Estoque e Custos) incluindo o histórico?')) { dispatch({type: 'RESET_ALL'}); if (user) { await clearAllHistory(user.uid); alert('Banco de dados e histórico limpos com sucesso!'); } } }}><Trash2 size={13}/> Apagar Tudo</button>
            </div>
          </div>
        </>}

        {/* ── PAGAMENTOS ── */}
        {tab === 'pagamentos' && <>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(124,58,237,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><CreditCard size={16} color="#7c3aed"/></div>
              <h4>{t('active_payments')}</h4>
            </div>
            <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:14}}>{t('payment_desc')}</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {Object.entries(payments).map(([met,on])=>(
                <div key={met} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'var(--bg-secondary)',borderRadius:8,border:`1px solid ${on?'rgba(124,58,237,0.25)':'var(--border)'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:8,height:8,borderRadius:50,background:on?'var(--purple-light)':'var(--text-muted)'}}/>
                    <span style={{fontSize:13,fontWeight:500,color:on?'var(--text-primary)':'var(--text-muted)'}}>{met}</span>
                  </div>
                  <div className={`toggle-track ${on?'on':''}`} onClick={()=>togglePayment(met)} style={{cursor:'pointer'}}><div className="toggle-thumb"/></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{borderColor:'rgba(124,58,237,0.3)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <h4>{t('about')}</h4><span className="badge badge-purple">v1.0.0</span>
            </div>
            <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}}>{t('about_desc')}</div>
            <div style={{display:'flex',gap:8,marginTop:14}}>
              <button className="btn btn-ghost btn-sm">📄 {t('export_json')}</button>
              <button className="btn btn-ghost btn-sm">📊 {t('export_csv')}</button>
            </div>
          </div>
        </>}

        {/* ── TAXAS ── */}
        {tab === 'taxas' && <>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:'var(--orange-glow)',display:'flex',alignItems:'center',justifyContent:'center'}}><DollarSign size={16} color="#f97316"/></div>
              <h4>{t('financial_settings')}</h4>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('exchange_rate')}</label>
                <input className="form-input" type="number" step="0.001" value={cambio} onChange={e=>setCambio(e.target.value)}/>
                <span style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>1 yuan (¥) = ${parseFloat(cambio||0).toFixed(3)} USD</span>
              </div>
              <div className="form-group">
                <label>{t('min_margin_alert')} (%)</label>
                <input className="form-input" type="number" value={margemAlerta} onChange={e=>setMargemAlerta(e.target.value)}/>
                <span style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>"Attention" badge below {margemAlerta}%</span>
              </div>
            </div>
            <div className="form-group" style={{marginTop:12}}>
              <label>{t('default_currency')}</label>
              <select className="form-select" value={currency} onChange={e=>setCurrency(e.target.value)}>
                <option value="USD">🇺🇸 USD — US Dollar ($)</option>
                <option value="EUR">🇪🇺 EUR — Euro (€)</option>
                <option value="BRL">🇧🇷 BRL — Brazilian Real (R$)</option>
              </select>
            </div>
          </div>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><TrendingUp size={16} color="#10b981"/></div>
              <h4>{t('platform_fees')}</h4>
            </div>
            <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:14}}>{t('platform_fees_desc')}</p>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {[
                {label:'Amazon Referral Fee (%)',val:amazonFee,set:setAmazonFee,desc:'Avg. 15% for apparel'},
                {label:'PayPal Transaction Fee (%)',val:paypalFee,set:setPaypalFee,desc:'Standard: 3.49% + $0.49'},
              ].map(f=>(
                <div key={f.label}>
                  <div className="form-group"><label>{f.label}</label><input className="form-input" type="number" step="0.01" value={f.val} onChange={e=>f.set(e.target.value)}/></div>
                  <span style={{fontSize:11,color:'var(--text-muted)',marginTop:4,display:'block'}}>{f.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* ── CANAIS ── */}
        {tab === 'canais' && <>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><BarChart3 size={16} color="#10b981"/></div>
              <h4>{t('active_channels')}</h4>
            </div>
            <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:14}}>{t('channels_desc')}</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {Object.entries(channels).map(([canal,on])=>(
                <div key={canal} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'var(--bg-secondary)',borderRadius:8,border:`1px solid ${on?'rgba(16,185,129,0.25)':'var(--border)'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:8,height:8,borderRadius:50,background:on?'#10b981':'var(--text-muted)'}}/>
                    <span style={{fontSize:13,fontWeight:500,color:on?'var(--text-primary)':'var(--text-muted)'}}>{canal}</span>
                  </div>
                  <div className={`toggle-track ${on?'on':''}`} onClick={()=>toggleChannel(canal)} style={{cursor:'pointer'}}><div className="toggle-thumb"/></div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* Save */}
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <button className="btn btn-primary" onClick={handleSave}>{saved ? t('saved') : t('save_settings')}</button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return <div className={`toggle-track ${on?'on':''}`} onClick={()=>setOn(!on)} style={{cursor:'pointer'}}><div className="toggle-thumb"/></div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MODALS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• 
function ModalVenda({ state, dispatch, user, onClose }) {
  const { t } = useI18n();
  const [tipo, setTipo] = useState('estoque');
  const [form, setForm] = useState({ produto:'', canal:'Amazon', pagamento:'Credit Card', valorOriginal:'', desconto:'0', cliente:'', custoUnitario:'', obs:'' });
  const u = (k,v) => setForm(p => ({...p, [k]: v}));
  const valorFinal = (parseFloat(form.valorOriginal)||0) - (parseFloat(form.desconto)||0);
  const save = () => {
    if(!form.produto || !form.valorOriginal) return;
    const vendedorNome = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Desconhecido';
    dispatch({ type: 'ADD_VENDA', payload: { data: new Date().toISOString().slice(0,10), produto: form.produto, canal: form.canal, pagamento: form.pagamento, valorOriginal: parseFloat(form.valorOriginal), desconto: parseFloat(form.desconto)||0, valorFinal, custoUnitario: parseFloat(form.custoUnitario)||0, cliente: form.cliente, obs: form.obs, tipo, vendedor: vendedorNome }});
    onClose();
  };
  return (
    <Modal title={t('new_sale')} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button><button className="btn btn-primary" onClick={save}>{t('new_sale')}</button></>}>
      <div className="form-group"><label>{t('type')}</label>
        <div className="radio-group">
          <div className={`radio-option ${tipo==='estoque'?'active':''}`} onClick={()=>setTipo('estoque')}>{t('sell_inventory')}</div>
          <div className={`radio-option ${tipo==='encomenda'?'active':''}`} onClick={()=>setTipo('encomenda')}>{t('custom_order')}</div>
        </div>
      </div>
      {tipo === 'estoque' ? (
        <div className="form-group"><label>{t('product')}</label><select className="form-select" value={form.produto} onChange={e=>u('produto',e.target.value)}><option value="">{t('select')}</option>{state.estoque.filter(e=>e.quantidade>0).map(e=><option key={e.id} value={e.produto}>{e.produto} ({e.tamanho}) - {e.quantidade} {t('units')}</option>)}</select></div>
      ) : (
        <div className="form-group"><label>{t('product')}</label><input className="form-input" placeholder={t('product_name')} value={form.produto} onChange={e=>u('produto',e.target.value)}/></div>
      )}
      <div className="form-group"><label>{t('customer_optional')}</label>
        <input className="form-input" list="clientes-list" placeholder={t('name')} value={form.cliente} onChange={e=>u('cliente',e.target.value)}/>
        <datalist id="clientes-list">{(state.clientes||[]).map(c => <option key={c.id} value={c.nome}/>)}</datalist>
      </div>
      <div className="form-row">
        <div className="form-group"><label>{t('channel')}</label><select className="form-select" value={form.canal} onChange={e=>u('canal',e.target.value)}>{CHANNELS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="form-group"><label>{t('payment')}</label><select className="form-select" value={form.pagamento} onChange={e=>u('pagamento',e.target.value)}>{PAYMENTS.map(p=><option key={p}>{p}</option>)}</select></div>
      </div>
      <div className="form-row-3">
        <div className="form-group"><label>{t('original_price')} $</label><input className="form-input" type="number" value={form.valorOriginal} onChange={e=>u('valorOriginal',e.target.value)}/></div>
        <div className="form-group"><label>{t('discount')} $</label><input className="form-input" type="number" value={form.desconto} onChange={e=>u('desconto',e.target.value)}/></div>
        <div className="form-group"><label>{t('cost')} $</label><input className="form-input" type="number" value={form.custoUnitario} onChange={e=>u('custoUnitario',e.target.value)}/></div>
      </div>
      <div className="preview-box">{t('final_price')}: <strong>{fmt(valorFinal)}</strong></div>
      <div className="form-group"><label>{t('notes')}</label><textarea className="form-textarea" value={form.obs} onChange={e=>u('obs',e.target.value)}/></div>
    </Modal>
  );
}

function ModalCompra({ state, dispatch, onClose }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ fornecedor:'', origem:'China', dataPedido: new Date().toISOString().slice(0,10), status:'Comprado', modoEnvio:'Remessa Conforme', frete:'0', taxaRemessa:'0' });
  const [itens, setItens] = useState([{ nome:'', tamanho:'M', quantidade:'1', custoYuan:'0', custoReal:'' }]);
  const u = (k,v) => setForm(p => ({...p, [k]: v}));
  const addItem = () => setItens(p => [...p, { nome:'', tamanho:'M', quantidade:'1', custoYuan:'0', custoReal:'' }]);
  const uItem = (i,k,v) => setItens(p => p.map((it,idx)=>idx===i?{...it,[k]:v}:it));
  const removeItem = (i) => setItens(p => p.filter((_,idx)=>idx!==i));
  const totalItens = itens.reduce((s,it) => s + (parseFloat(it.custoReal)||0) * (parseInt(it.quantidade)||0), 0);
  const total = totalItens + (parseFloat(form.frete)||0) + (parseFloat(form.taxaRemessa)||0);
  const save = () => {
    if(!form.fornecedor) return;
    dispatch({ type:'ADD_COMPRA', payload: { ...form, frete:parseFloat(form.frete)||0, taxaRemessa:parseFloat(form.taxaRemessa)||0, itens: itens.map(it=>({...it, quantidade:parseInt(it.quantidade)||0, custoYuan:parseFloat(it.custoYuan)||0, custoReal:parseFloat(it.custoReal)||0})) }});
    onClose();
  };
  return (
    <Modal title={t('new_purchase')} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button><button className="btn btn-primary" onClick={save}>{t('new_purchase')}</button></>}>
      <div className="form-row">
        <div className="form-group"><label>{t('supplier')}</label>
          <input className="form-input" list="fornecedores-list" placeholder={t('name')} value={form.fornecedor} onChange={e=>u('fornecedor',e.target.value)}/>
          <datalist id="fornecedores-list">{(state?.fornecedores||[]).map(f => <option key={f.id} value={f.nome}/>)}</datalist>
        </div>
        <div className="form-group"><label>{t('origin')}</label><select className="form-select" value={form.origem} onChange={e=>u('origem',e.target.value)}><option>China</option><option>Domestic</option></select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>{t('order_date')}</label><input className="form-input" type="date" value={form.dataPedido} onChange={e=>u('dataPedido',e.target.value)}/></div>
        <div className="form-group"><label>{t('status')}</label><select className="form-select" value={form.status} onChange={e=>u('status',e.target.value)}>{STATUSES_COMPRA.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="form-group"><label>{t('shipping_mode')}</label>
        <div className="radio-group">
          {['Remessa Conforme','Offline','CSSBuy'].map(m=><div key={m} className={`radio-option ${form.modoEnvio===m?'active':''}`} onClick={()=>u('modoEnvio',m)}>{m}</div>)}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>{t('shipping')} $</label><input className="form-input" type="number" value={form.frete} onChange={e=>u('frete',e.target.value)}/></div>
        <div className="form-group"><label>{t('remittance_fee')} $</label><input className="form-input" type="number" value={form.taxaRemessa} onChange={e=>u('taxaRemessa',e.target.value)}/></div>
      </div>
      <div className="section-title" style={{marginTop:8}}>{t('order_items')}</div>
      {itens.map((it,i) => (
        <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,alignItems:'end'}}>
          <div className="form-group"><label style={{fontSize:10}}>{i===0 ? t('product') : ''}</label><input className="form-input" placeholder={t('product_name')} value={it.nome} onChange={e=>uItem(i,'nome',e.target.value)}/></div>
          <div className="form-group"><label style={{fontSize:10}}>{i===0 ? t('size') : ''}</label><input className="form-input" value={it.tamanho} onChange={e=>uItem(i,'tamanho',e.target.value)}/></div>
          <div className="form-group"><label style={{fontSize:10}}>{i===0 ? t('qty') : ''}</label><input className="form-input" type="number" value={it.quantidade} onChange={e=>uItem(i,'quantidade',e.target.value)}/></div>
          <div className="form-group"><label style={{fontSize:10}}>{i===0 ? t('cost') : ''}</label><input className="form-input" type="number" value={it.custoReal} onChange={e=>uItem(i,'custoReal',e.target.value)}/></div>
          <button className="btn btn-ghost btn-sm" onClick={()=>removeItem(i)} style={{marginBottom:1}}><Trash2 size={13}/></button>
        </div>
      ))}
      <button className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={13}/> {t('add_item')}</button>
      <div className="preview-box">{t('order_total')}: <strong>{fmt(total)}</strong></div>
    </Modal>
  );
}

function ModalCusto({ dispatch, onClose }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ nome:'', valorTotal:'', quantidade:'' });
  const u = (k,v) => setForm(p => ({...p, [k]: v}));
  const cpp = (parseFloat(form.valorTotal)||0) / (parseInt(form.quantidade)||1);
  const save = () => {
    if(!form.nome || !form.valorTotal || !form.quantidade) return;
    dispatch({ type:'ADD_CUSTO', payload:{ nome:form.nome, valorTotal:parseFloat(form.valorTotal), quantidade:parseInt(form.quantidade) }});
    onClose();
  };
  return (
    <Modal title={t('new_fixed_cost')} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button><button className="btn btn-primary" onClick={save}>{t('new_fixed_cost')}</button></>}>
      <div className="form-group"><label>{t('name')}</label><input className="form-input" placeholder='e.g. "Custom poly mailer"' value={form.nome} onChange={e=>u('nome',e.target.value)}/></div>
      <div className="form-row">
        <div className="form-group"><label>{t('total_paid')} $</label><input className="form-input" type="number" value={form.valorTotal} onChange={e=>u('valorTotal',e.target.value)}/></div>
        <div className="form-group"><label>{t('qty_purchased')}</label><input className="form-input" type="number" value={form.quantidade} onChange={e=>u('quantidade',e.target.value)}/></div>
      </div>
      <div className="preview-box">{t('cost_per_unit')}: <strong>{fmt(cpp)}</strong></div>
    </Modal>
  );
}

function ModalEstoque({ dispatch, onClose }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ produto:'', tamanho:'M', quantidade:'1', custoMedio:'' });
  const u = (k,v) => setForm(p => ({...p, [k]: v}));
  const totalValue = (parseInt(form.quantidade)||0) * (parseFloat(form.custoMedio)||0);
  const save = () => {
    if(!form.produto || !form.custoMedio) return;
    dispatch({ type:'ADD_ESTOQUE', payload:{ produto:form.produto, tamanho:form.tamanho, quantidade:parseInt(form.quantidade)||0, custoMedio:parseFloat(form.custoMedio)||0 }});
    onClose();
  };
  return (
    <Modal title={t('new_product')} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button><button className="btn btn-primary" onClick={save}><Plus size={14}/> {t('add_to_stock')}</button></>}>
      <div className="form-group"><label>{t('product')}</label><input className="form-input" placeholder={t('product_name')} value={form.produto} onChange={e=>u('produto',e.target.value)}/></div>
      <div className="form-row">
        <div className="form-group"><label>{t('size')}</label>
          <select className="form-select" value={form.tamanho} onChange={e=>u('tamanho',e.target.value)}>
            {['PP','P','M','G','GG','XG','Único'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group"><label>{t('qty')}</label><input className="form-input" type="number" min="0" value={form.quantidade} onChange={e=>u('quantidade',e.target.value)}/></div>
      </div>
      <div className="form-group"><label>{t('avg_cost')} $</label><input className="form-input" type="number" step="0.01" value={form.custoMedio} onChange={e=>u('custoMedio',e.target.value)}/></div>
      <div className="preview-box">{t('total_value')}: <strong>{fmt(totalValue)}</strong></div>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE: CADASTROS (Clientes e Fornecedores)
// ──────────────────────────────────────────────────────────────────────────
function PageCadastros({ state, dispatch, setModal }) {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState('cliente');
  const lista = tab === 'cliente' ? (state.clientes || []) : (state.fornecedores || []);
  const isCli = tab === 'cliente';
  const labels = lang === 'pt'
    ? { cli: 'Clientes', forn: 'Fornecedores', novoCli: 'Novo Cliente', novoForn: 'Novo Fornecedor', nome: 'Nome', email: 'Email', tel: 'Telefone', doc: 'CPF/CNPJ', obs: 'Observações', vazio: 'Nenhum cadastro ainda', acoes: 'Ações' }
    : { cli: 'Customers', forn: 'Suppliers', novoCli: 'New Customer', novoForn: 'New Supplier', nome: 'Name', email: 'Email', tel: 'Phone', doc: 'Tax ID', obs: 'Notes', vazio: 'No records yet', acoes: 'Actions' };
  return (
    <div>
      <div className="tabs" style={{display:'flex',gap:8,marginBottom:16}}>
        <button className={`btn ${isCli?'btn-primary':'btn-ghost'} btn-sm`} onClick={()=>setTab('cliente')}>{labels.cli}</button>
        <button className={`btn ${!isCli?'btn-primary':'btn-ghost'} btn-sm`} onClick={()=>setTab('fornecedor')}>{labels.forn}</button>
        <div style={{flex:1}}/>
        <button className="btn btn-primary btn-sm" onClick={()=>setModal(isCli ? 'cadastro-cliente' : 'cadastro-fornecedor')}>
          <Plus size={14}/> {isCli ? labels.novoCli : labels.novoForn}
        </button>
      </div>
      {lista.length === 0 ? (
        <EmptyState
          title={labels.vazio}
          desc={isCli ? labels.novoCli : labels.novoForn}
          action={isCli ? labels.novoCli : labels.novoForn}
          onAction={()=>setModal(isCli ? 'cadastro-cliente' : 'cadastro-fornecedor')}
        />
      ) : (
        <div className="card">
          <table>
            <thead><tr><th>{labels.nome}</th><th>{labels.email}</th><th>{labels.tel}</th><th>{labels.doc}</th><th>{labels.obs}</th><th>{labels.acoes}</th></tr></thead>
            <tbody>
              {lista.map(item => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.email || '—'}</td>
                  <td>{item.telefone || '—'}</td>
                  <td>{item.documento || '—'}</td>
                  <td>{item.obs || '—'}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => dispatch({ type: isCli ? 'DEL_CLIENTE' : 'DEL_FORNECEDOR', id: item.id })}
                    ><Trash2 size={13}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MODAL: CADASTRO (Cliente / Fornecedor)
// ──────────────────────────────────────────────────────────────────────────
function ModalCadastro({ tipoInicial = 'cliente', dispatch, onClose }) {
  const { lang } = useI18n();
  const [tipo, setTipo] = useState(tipoInicial);
  const [form, setForm] = useState({ nome:'', email:'', telefone:'', documento:'', obs:'' });
  const u = (k,v) => setForm(p => ({ ...p, [k]: v }));
  const labels = lang === 'pt'
    ? { titulo: 'Novo Cadastro', cli: 'Cliente', forn: 'Fornecedor', nome: 'Nome', email: 'Email', tel: 'Telefone', doc: 'CPF/CNPJ', obs: 'Observações', salvar: 'Salvar', cancelar: 'Cancelar' }
    : { titulo: 'New Contact', cli: 'Customer', forn: 'Supplier', nome: 'Name', email: 'Email', tel: 'Phone', doc: 'Tax ID', obs: 'Notes', salvar: 'Save', cancelar: 'Cancel' };
  const save = () => {
    if (!form.nome.trim()) return;
    dispatch({
      type: tipo === 'cliente' ? 'ADD_CLIENTE' : 'ADD_FORNECEDOR',
      payload: { ...form, nome: form.nome.trim(), criadoEm: new Date().toISOString() },
    });
    onClose();
  };
  return (
    <Modal
      title={labels.titulo}
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{labels.cancelar}</button>
        <button className="btn btn-primary" onClick={save}>{labels.salvar}</button>
      </>}
    >
      <div className="form-group">
        <div className="radio-group">
          <div className={`radio-option ${tipo==='cliente'?'active':''}`} onClick={()=>setTipo('cliente')}>{labels.cli}</div>
          <div className={`radio-option ${tipo==='fornecedor'?'active':''}`} onClick={()=>setTipo('fornecedor')}>{labels.forn}</div>
        </div>
      </div>
      <div className="form-group"><label>{labels.nome}</label>
        <input className="form-input" value={form.nome} onChange={e=>u('nome',e.target.value)} autoFocus/>
      </div>
      <div className="form-row">
        <div className="form-group"><label>{labels.email}</label>
          <input className="form-input" type="email" value={form.email} onChange={e=>u('email',e.target.value)}/>
        </div>
        <div className="form-group"><label>{labels.tel}</label>
          <input className="form-input" value={form.telefone} onChange={e=>u('telefone',e.target.value)}/>
        </div>
      </div>
      <div className="form-group"><label>{labels.doc}</label>
        <input className="form-input" value={form.documento} onChange={e=>u('documento',e.target.value)}/>
      </div>
      <div className="form-group"><label>{labels.obs}</label>
        <textarea className="form-textarea" value={form.obs} onChange={e=>u('obs',e.target.value)}/>
      </div>
    </Modal>
  );
}
