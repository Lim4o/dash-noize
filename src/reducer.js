export const initialState = {
  vendas: [],
  compras: [],
  estoque: [],
  custosFixos: [],
  clientes: [],
  fornecedores: [],
};

export const STATUS_CHEGOU = 'Chegou';

const norm = (s) => (s == null ? '' : String(s).trim());
const sameNameAndSize = (e, nome, tamanho) =>
  norm(e.produto) === norm(nome) && norm(e.tamanho) === norm(tamanho);

const findEstoqueIndexForVenda = (estoque, venda) => {
  if (venda?.estoqueItemId != null) {
    const idx = estoque.findIndex(e => e.id === venda.estoqueItemId);
    if (idx >= 0) return idx;
  }
  return estoque.findIndex(e => sameNameAndSize(e, venda?.produto, venda?.tamanho));
};

const weightedAvg = (oldQty, oldCost, addQty, addCost) => {
  const total = oldQty + addQty;
  if (total <= 0) return oldCost;
  return (oldQty * oldCost + addQty * addCost) / total;
};

// direction: +1 (compra chegou / entra) | -1 (compra voltou / sai)
const applyCompraToEstoque = (estoque, compra, direction, baseId) => {
  const result = [...estoque];
  let nextId = baseId + 1;
  for (const it of compra.itens || []) {
    const qty = (Number(it.quantidade) || 0) * direction;
    const cost = Number(it.custoReal) || 0;
    const idx = result.findIndex(e => sameNameAndSize(e, it.nome, it.tamanho));
    if (idx >= 0) {
      const prev = result[idx];
      result[idx] = {
        ...prev,
        quantidade: Math.max(0, prev.quantidade + qty),
        custoMedio: direction > 0
          ? weightedAvg(prev.quantidade, prev.custoMedio || 0, qty, cost)
          : prev.custoMedio,
      };
    } else if (direction > 0) {
      result.push({
        id: nextId++,
        produto: norm(it.nome),
        tamanho: norm(it.tamanho),
        quantidade: qty,
        custoMedio: cost,
      });
    }
  }
  return result;
};

export function reducer(state, action) {
  switch (action.type) {
    case 'ADD_VENDA': {
      const venda = { ...action.payload, id: Date.now() };
      let estoque = state.estoque;
      if (venda.tipo === 'estoque') {
        const idx = findEstoqueIndexForVenda(estoque, venda);
        if (idx >= 0) {
          estoque = estoque.map((e, i) =>
            i === idx ? { ...e, quantidade: Math.max(0, e.quantidade - 1) } : e
          );
        }
      }
      return { ...state, vendas: [...state.vendas, venda], estoque };
    }
    case 'ADD_COMPRA': {
      const compraId = Date.now();
      const compra = { ...action.payload, id: compraId };
      const estoque = compra.status === STATUS_CHEGOU
        ? applyCompraToEstoque(state.estoque, compra, +1, compraId)
        : state.estoque;
      return { ...state, compras: [...state.compras, compra], estoque };
    }
    case 'UPDATE_COMPRA_STATUS': {
      const compra = state.compras.find(c => c.id === action.id);
      if (!compra) return state;
      const oldStatus = compra.status;
      const newStatus = action.status;
      let estoque = state.estoque;
      if (oldStatus !== STATUS_CHEGOU && newStatus === STATUS_CHEGOU) {
        estoque = applyCompraToEstoque(estoque, compra, +1, Date.now());
      } else if (oldStatus === STATUS_CHEGOU && newStatus !== STATUS_CHEGOU) {
        estoque = applyCompraToEstoque(estoque, compra, -1, Date.now());
      }
      return {
        ...state,
        estoque,
        compras: state.compras.map(c => c.id === action.id ? { ...c, status: newStatus } : c),
      };
    }
    case 'ADD_CUSTO': return { ...state, custosFixos: [...state.custosFixos, { ...action.payload, id: Date.now() }] };
    case 'DEL_VENDA': {
      const venda = state.vendas.find(v => v.id === action.id);
      let estoque = state.estoque;
      if (venda?.tipo === 'estoque') {
        const idx = findEstoqueIndexForVenda(estoque, venda);
        if (idx >= 0) {
          estoque = estoque.map((e, i) =>
            i === idx ? { ...e, quantidade: e.quantidade + 1 } : e
          );
        }
      }
      return { ...state, vendas: state.vendas.filter(v => v.id !== action.id), estoque };
    }
    case 'DEL_COMPRA': {
      const compra = state.compras.find(c => c.id === action.id);
      const estoque = compra?.status === STATUS_CHEGOU
        ? applyCompraToEstoque(state.estoque, compra, -1, Date.now())
        : state.estoque;
      return { ...state, compras: state.compras.filter(c => c.id !== action.id), estoque };
    }
    case 'DEL_CUSTO': return { ...state, custosFixos: state.custosFixos.filter(c => c.id !== action.id) };
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
