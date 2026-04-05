// Lightweight chainable Supabase mock for tests.
// Exports `supabase` and `__mockSupabase` helpers to configure per-table results.
const tableMocks = new Map();

function makeAsync(val) {
  return Promise.resolve(val);
}

function getResult(table, op, args) {
  const key = `${table}:${op}`;
  if (tableMocks.has(key)) {
    const v = tableMocks.get(key);
    return typeof v === 'function' ? v({ table, op, args }) : v;
  }
  return { data: null, error: null };
}

function createQuery(table) {
  const qb = {
    _table: table,
    _lastCall: null,
  };

  qb.select = jest.fn((...args) => {
    qb._lastCall = { op: 'select', args };
    return makeAsync(getResult(table, 'select', args));
  });

  qb.insert = jest.fn((payload) => {
    qb._lastCall = { op: 'insert', args: [payload] };
    return makeAsync(getResult(table, 'insert', payload));
  });

  qb.update = jest.fn((payload) => {
    qb._lastCall = { op: 'update', args: [payload] };
    return makeAsync(getResult(table, 'update', payload));
  });

  qb.delete = jest.fn((...args) => {
    qb._lastCall = { op: 'delete', args };
    return makeAsync(getResult(table, 'delete', args));
  });

  // Chainable filters
  qb.eq = jest.fn((field, value) => {
    qb._lastCall = { op: 'eq', args: [field, value] };
    return qb;
  });
  qb.match = jest.fn((obj) => {
    qb._lastCall = { op: 'match', args: [obj] };
    return qb;
  });
  qb.order = jest.fn(() => qb);
  qb.limit = jest.fn(() => qb);

  qb.single = jest.fn(async () => {
    const res = getResult(table, 'single');
    if (Array.isArray(res.data))
      return { data: res.data[0] ?? null, error: res.error ?? null };
    return res;
  });

  return qb;
}

const supabase = {
  from: (table) => createQuery(table),
};

const __mockSupabase = {
  reset: () => tableMocks.clear(),
  set: (table, op, resultOrFn) => tableMocks.set(`${table}:${op}`, resultOrFn),
  get: (table, op) => tableMocks.get(`${table}:${op}`),
  _tableMocks: tableMocks,
};

module.exports = { supabase, __mockSupabase };
