import { describe, it, expect } from 'vitest';
import { reducer, initialState } from './reducer';

const seedEstoque = (items) => reducer(initialState, {
  type: 'LOAD_STATE',
  payload: { estoque: items },
});

describe('Reducer — operações básicas (comportamento atual)', () => {
  it('ADD_ESTOQUE: adiciona item novo ao estoque', () => {
    const s = reducer(initialState, {
      type: 'ADD_ESTOQUE',
      payload: { produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 },
    });
    expect(s.estoque).toHaveLength(1);
    expect(s.estoque[0]).toMatchObject({ produto: 'Camiseta', quantidade: 10 });
  });

  it('UPDATE_ESTOQUE_QTD: altera quantidade de um item existente', () => {
    const seeded = seedEstoque([{ id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 }]);
    const s = reducer(seeded, { type: 'UPDATE_ESTOQUE_QTD', id: 1, quantidade: 7 });
    expect(s.estoque[0].quantidade).toBe(7);
  });

  it('UPDATE_ESTOQUE_QTD: não deixa quantidade ficar negativa', () => {
    const seeded = seedEstoque([{ id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 2, custoMedio: 25 }]);
    const s = reducer(seeded, { type: 'UPDATE_ESTOQUE_QTD', id: 1, quantidade: -5 });
    expect(s.estoque[0].quantidade).toBe(0);
  });

  it('DEL_ESTOQUE: remove item do estoque', () => {
    const seeded = seedEstoque([{ id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 }]);
    const s = reducer(seeded, { type: 'DEL_ESTOQUE', id: 1 });
    expect(s.estoque).toHaveLength(0);
  });

  it('ADD_VENDA: adiciona venda à lista', () => {
    const s = reducer(initialState, {
      type: 'ADD_VENDA',
      payload: { produto: 'Camiseta', valorFinal: 80, custoUnitario: 25, tipo: 'estoque' },
    });
    expect(s.vendas).toHaveLength(1);
  });

  it('ADD_COMPRA: adiciona compra à lista', () => {
    const s = reducer(initialState, {
      type: 'ADD_COMPRA',
      payload: { fornecedor: 'Fab X', itens: [{ nome: 'Camiseta', tamanho: 'M', quantidade: 20, custoReal: 15 }] },
    });
    expect(s.compras).toHaveLength(1);
  });

  it('RESET_ESTOQUE: limpa estoque e compras', () => {
    const seeded = reducer(initialState, {
      type: 'LOAD_STATE',
      payload: {
        estoque: [{ id: 1, produto: 'A', quantidade: 5 }],
        compras: [{ id: 2, fornecedor: 'X' }],
      },
    });
    const s = reducer(seeded, { type: 'RESET_ESTOQUE' });
    expect(s.estoque).toEqual([]);
    expect(s.compras).toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────────
// INTEGRAÇÃO: estes testes expressam o COMPORTAMENTO ESPERADO.
// Se algum falhar, existe um bug de integração entre os módulos.
// ───────────────────────────────────────────────────────────────────────

describe('Integração — Venda do estoque deve abater o estoque', () => {
  it('vender 1 unidade de um produto em estoque deve decrementar a quantidade', () => {
    const seeded = seedEstoque([
      { id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 },
    ]);
    const s = reducer(seeded, {
      type: 'ADD_VENDA',
      payload: { produto: 'Camiseta', tamanho: 'M', tipo: 'estoque', valorFinal: 80, custoUnitario: 25 },
    });
    expect(s.estoque[0].quantidade).toBe(9);
  });

  it('encomenda (tipo != estoque) NÃO deve mexer no estoque', () => {
    const seeded = seedEstoque([
      { id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 },
    ]);
    const s = reducer(seeded, {
      type: 'ADD_VENDA',
      payload: { produto: 'Camiseta', tipo: 'encomenda', valorFinal: 80 },
    });
    expect(s.estoque[0].quantidade).toBe(10);
  });
});

describe("Integração — Compra só alimenta estoque quando status='Chegou'", () => {
  it("ADD_COMPRA com status='Chegou' de produto novo cria item no estoque", () => {
    const s = reducer(initialState, {
      type: 'ADD_COMPRA',
      payload: {
        fornecedor: 'Fab X',
        status: 'Chegou',
        itens: [{ nome: 'Boné', tamanho: 'U', quantidade: 20, custoReal: 15 }],
      },
    });
    const item = s.estoque.find(e => e.produto === 'Boné' && e.tamanho === 'U');
    expect(item).toBeDefined();
    expect(item.quantidade).toBe(20);
  });

  it("ADD_COMPRA com status='Chegou' de produto existente soma quantidade", () => {
    const seeded = seedEstoque([
      { id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 },
    ]);
    const s = reducer(seeded, {
      type: 'ADD_COMPRA',
      payload: {
        fornecedor: 'Fab X',
        status: 'Chegou',
        itens: [{ nome: 'Camiseta', tamanho: 'M', quantidade: 5, custoReal: 20 }],
      },
    });
    const item = s.estoque.find(e => e.produto === 'Camiseta' && e.tamanho === 'M');
    expect(item.quantidade).toBe(15);
  });

  it("ADD_COMPRA com status='Comprado' NÃO mexe no estoque", () => {
    const seeded = seedEstoque([
      { id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 },
    ]);
    const s = reducer(seeded, {
      type: 'ADD_COMPRA',
      payload: {
        fornecedor: 'Fab X',
        status: 'Comprado',
        itens: [{ nome: 'Camiseta', tamanho: 'M', quantidade: 5, custoReal: 20 }],
      },
    });
    expect(s.estoque[0].quantidade).toBe(10);
  });

  it("ADD_COMPRA com status='A Caminho' NÃO cria item novo no estoque", () => {
    const s = reducer(initialState, {
      type: 'ADD_COMPRA',
      payload: {
        fornecedor: 'Fab X',
        status: 'A Caminho',
        itens: [{ nome: 'Boné', tamanho: 'U', quantidade: 20, custoReal: 15 }],
      },
    });
    expect(s.estoque).toHaveLength(0);
  });
});

describe('Integração — Transições de status da compra', () => {
  const seedCompra = (status) => reducer(initialState, {
    type: 'LOAD_STATE',
    payload: {
      compras: [{
        id: 999,
        fornecedor: 'Fab X',
        status,
        itens: [{ nome: 'Boné', tamanho: 'U', quantidade: 20, custoReal: 15 }],
      }],
    },
  });

  it("Comprado → Chegou alimenta o estoque", () => {
    const seeded = seedCompra('Comprado');
    const s = reducer(seeded, { type: 'UPDATE_COMPRA_STATUS', id: 999, status: 'Chegou' });
    const item = s.estoque.find(e => e.produto === 'Boné');
    expect(item?.quantidade).toBe(20);
    expect(s.compras[0].status).toBe('Chegou');
  });

  it("A Caminho → Chegou alimenta o estoque", () => {
    const seeded = seedCompra('A Caminho');
    const s = reducer(seeded, { type: 'UPDATE_COMPRA_STATUS', id: 999, status: 'Chegou' });
    const item = s.estoque.find(e => e.produto === 'Boné');
    expect(item?.quantidade).toBe(20);
  });

  it("Chegou → A Caminho remove do estoque (reverte)", () => {
    const seeded = reducer(initialState, {
      type: 'LOAD_STATE',
      payload: {
        estoque: [{ id: 1, produto: 'Boné', tamanho: 'U', quantidade: 20, custoMedio: 15 }],
        compras: [{
          id: 999,
          fornecedor: 'Fab X',
          status: 'Chegou',
          itens: [{ nome: 'Boné', tamanho: 'U', quantidade: 20, custoReal: 15 }],
        }],
      },
    });
    const s = reducer(seeded, { type: 'UPDATE_COMPRA_STATUS', id: 999, status: 'A Caminho' });
    expect(s.estoque[0].quantidade).toBe(0);
    expect(s.compras[0].status).toBe('A Caminho');
  });

  it("Comprado → A Caminho NÃO mexe no estoque", () => {
    const seeded = seedCompra('Comprado');
    const s = reducer(seeded, { type: 'UPDATE_COMPRA_STATUS', id: 999, status: 'A Caminho' });
    expect(s.estoque).toHaveLength(0);
  });
});

describe('Integração — Custo médio ponderado', () => {
  it('ADD_COMPRA em item existente recalcula custoMedio como média ponderada', () => {
    const seeded = seedEstoque([
      { id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 20 },
    ]);
    const s = reducer(seeded, {
      type: 'ADD_COMPRA',
      payload: {
        fornecedor: 'Fab X',
        status: 'Chegou',
        itens: [{ nome: 'Camiseta', tamanho: 'M', quantidade: 10, custoReal: 30 }],
      },
    });
    // (10 * 20 + 10 * 30) / 20 = 25
    expect(s.estoque[0].custoMedio).toBeCloseTo(25);
    expect(s.estoque[0].quantidade).toBe(20);
  });

  it('ADD_COMPRA em item novo usa custoReal como custoMedio inicial', () => {
    const s = reducer(initialState, {
      type: 'ADD_COMPRA',
      payload: {
        fornecedor: 'Fab X',
        status: 'Chegou',
        itens: [{ nome: 'Boné', tamanho: 'U', quantidade: 5, custoReal: 12 }],
      },
    });
    expect(s.estoque[0].custoMedio).toBe(12);
  });
});

describe('Integração — Match por estoqueItemId (produtos com mesmo nome)', () => {
  it('ADD_VENDA decrementa o item correto quando há dois itens com o mesmo produto em tamanhos diferentes', () => {
    const seeded = seedEstoque([
      { id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 },
      { id: 2, produto: 'Camiseta', tamanho: 'G', quantidade: 10, custoMedio: 25 },
    ]);
    const s = reducer(seeded, {
      type: 'ADD_VENDA',
      payload: { produto: 'Camiseta', tamanho: 'G', estoqueItemId: 2, tipo: 'estoque', valorFinal: 80 },
    });
    expect(s.estoque.find(e => e.id === 1).quantidade).toBe(10);
    expect(s.estoque.find(e => e.id === 2).quantidade).toBe(9);
  });

  it('DEL_VENDA devolve pro item certo usando estoqueItemId', () => {
    const seeded = reducer(initialState, {
      type: 'LOAD_STATE',
      payload: {
        estoque: [
          { id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 10, custoMedio: 25 },
          { id: 2, produto: 'Camiseta', tamanho: 'G', quantidade: 9, custoMedio: 25 },
        ],
        vendas: [
          { id: 999, produto: 'Camiseta', tamanho: 'G', estoqueItemId: 2, tipo: 'estoque', valorFinal: 80 },
        ],
      },
    });
    const s = reducer(seeded, { type: 'DEL_VENDA', id: 999 });
    expect(s.estoque.find(e => e.id === 1).quantidade).toBe(10);
    expect(s.estoque.find(e => e.id === 2).quantidade).toBe(10);
  });
});

describe('Integração — Robustez no matching', () => {
  it('match por produto+tamanho é tolerante a espaços', () => {
    const seeded = seedEstoque([
      { id: 1, produto: ' Camiseta ', tamanho: 'M', quantidade: 10, custoMedio: 25 },
    ]);
    const s = reducer(seeded, {
      type: 'ADD_COMPRA',
      payload: {
        fornecedor: 'Fab X',
        status: 'Chegou',
        itens: [{ nome: 'Camiseta', tamanho: 'M ', quantidade: 5, custoReal: 20 }],
      },
    });
    expect(s.estoque).toHaveLength(1);
    expect(s.estoque[0].quantidade).toBe(15);
  });
});

describe('Integração — Exclusões devem reverter o estoque', () => {
  it('DEL_VENDA (tipo=estoque) deve devolver unidade ao estoque', () => {
    const seeded = reducer(initialState, {
      type: 'LOAD_STATE',
      payload: {
        estoque: [{ id: 1, produto: 'Camiseta', tamanho: 'M', quantidade: 9, custoMedio: 25 }],
        vendas: [{ id: 999, produto: 'Camiseta', tamanho: 'M', tipo: 'estoque', valorFinal: 80 }],
      },
    });
    const s = reducer(seeded, { type: 'DEL_VENDA', id: 999 });
    expect(s.estoque[0].quantidade).toBe(10);
  });

  it("DEL_COMPRA de uma compra 'Chegou' deve remover as quantidades do estoque", () => {
    const seeded = reducer(initialState, {
      type: 'LOAD_STATE',
      payload: {
        estoque: [{ id: 1, produto: 'Boné', tamanho: 'U', quantidade: 20, custoMedio: 15 }],
        compras: [{
          id: 999,
          fornecedor: 'Fab X',
          status: 'Chegou',
          itens: [{ nome: 'Boné', tamanho: 'U', quantidade: 20, custoReal: 15 }],
        }],
      },
    });
    const s = reducer(seeded, { type: 'DEL_COMPRA', id: 999 });
    const item = s.estoque.find(e => e.produto === 'Boné' && e.tamanho === 'U');
    expect(item?.quantidade ?? 0).toBe(0);
  });

  it("DEL_COMPRA de uma compra não-'Chegou' NÃO mexe no estoque", () => {
    const seeded = reducer(initialState, {
      type: 'LOAD_STATE',
      payload: {
        estoque: [{ id: 1, produto: 'Boné', tamanho: 'U', quantidade: 20, custoMedio: 15 }],
        compras: [{
          id: 999,
          fornecedor: 'Fab X',
          status: 'Comprado',
          itens: [{ nome: 'Boné', tamanho: 'U', quantidade: 20, custoReal: 15 }],
        }],
      },
    });
    const s = reducer(seeded, { type: 'DEL_COMPRA', id: 999 });
    expect(s.estoque[0].quantidade).toBe(20);
  });
});
