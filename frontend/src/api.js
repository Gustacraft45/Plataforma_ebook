// api.js — centraliza todas as chamadas ao backend

const BASE = 'http://localhost:5000';

const headers = (withAuth = true) => ({
  'Content-Type': 'application/json',
  ...(withAuth && { Authorization: `Bearer ${localStorage.getItem('token')}` }),
});

export const api = {
  auth: {
    login: (email, password) =>
      fetch(`${BASE}/api/auth/login`, {
        method: 'POST', headers: headers(false),
        body: JSON.stringify({ email, password }),
      }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),

    register: (name, email, password) =>
      fetch(`${BASE}/api/auth/register`, {
        method: 'POST', headers: headers(false),
        body: JSON.stringify({ name, email, password }),
      }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  },

  books: {
    list: () =>
      fetch(`${BASE}/api/books`, { headers: headers() })
        .then(r => r.json().then(d => ({ ok: r.ok, data: d }))),

    get: (id) =>
      fetch(`${BASE}/api/books/${id}`, { headers: headers() })
        .then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  },

  evaluate: (question, studentAnswer) =>
    fetch(`${BASE}/api/evaluate`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ question, studentAnswer }),
    }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),

  user: {
    me: () =>
      fetch(`${BASE}/api/user/me`, { headers: headers() })
        .then(r => r.json().then(d => ({ ok: r.ok, data: d }))),

    progress: (bookId, currentNode, isCorrect) =>
      fetch(`${BASE}/api/user/progress`, {
        method: 'PATCH', headers: headers(),
        body: JSON.stringify({ bookId, currentNode, isCorrect }),
      }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  },
};
