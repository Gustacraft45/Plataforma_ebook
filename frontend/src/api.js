const BASE = 'http://localhost:5000';

const h = (auth = true) => ({
  'Content-Type': 'application/json',
  ...(auth && { Authorization: `Bearer ${localStorage.getItem('token')}` }),
});

const call = async (url, opts = {}) => {
  const r = await fetch(url, opts);
  const data = await r.json();
  return { ok: r.ok, status: r.status, data };
};

export const api = {
  auth: {
    login:    (email, password)        => call(`${BASE}/api/auth/login`,    { method: 'POST', headers: h(false), body: JSON.stringify({ email, password }) }),
    register: (name, email, password, role) => call(`${BASE}/api/auth/register`, { method: 'POST', headers: h(false), body: JSON.stringify({ name, email, password, role }) }),
  },
  books: {
    list:   ()     => call(`${BASE}/api/books`,       { headers: h() }),
    mine:   ()     => call(`${BASE}/api/books/mine`,  { headers: h() }),
    get:    (id)   => call(`${BASE}/api/books/${id}`, { headers: h() }),
    create: (data) => call(`${BASE}/api/books/create`,{ method: 'POST',   headers: h(), body: JSON.stringify(data) }),
    update: (id, data) => call(`${BASE}/api/books/${id}`, { method: 'PUT',    headers: h(), body: JSON.stringify(data) }),
    delete: (id)   => call(`${BASE}/api/books/${id}`, { method: 'DELETE', headers: h() }),
  },
  evaluate: (question, studentAnswer, expectedAnswer = '') =>
    call(`${BASE}/api/evaluate`, { method: 'POST', headers: h(), body: JSON.stringify({ question, studentAnswer, expectedAnswer }) }),
  user: {
    me:        ()     => call(`${BASE}/api/user/me`,        { headers: h() }),
    analytics: ()     => call(`${BASE}/api/user/analytics`, { headers: h() }),
    report:    ()     => call(`${BASE}/api/user/report`,    { headers: h() }),
    progress:  (data) => call(`${BASE}/api/user/progress`,  { method: 'PATCH', headers: h(), body: JSON.stringify(data) }),
  },
};
