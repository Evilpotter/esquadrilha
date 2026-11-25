// ---------- Skins (só visual: não mudam vida, dano nem velocidade) ----------
const SKIN_OUT = '#24160c';
const RARITY = { base: ['Original', '#9fb3c8'], c: ['Comum', '#6FCF5A'], r: ['Raro', '#4EA3FF'], e: ['Épico', '#B57BFF'], l: ['Lendário', '#FF9A2E'] };
const SKINS = [
  { id: 'classic', name: 'Original', rar: 'base', how: 'Sempre disponível' },
  { id: 'sucata', name: 'Engenhoca de Sucata', rar: 'c', how: 'Sempre disponível', shot: '#ff9a3c', trail: 'puff', tcol: '#9a9a9a',
    pal: { wing: '#8A8F96', body: '#E08A2E', dark: '#5a5f68', ck: '#7FD3E8', trim: '#C9B27A' } },
  { id: 'bosque', name: 'Bosque Ancestral', rar: 'c', how: 'Chegar à fase 2', req: { phase: 2 }, shot: '#8ee05a', trail: 'leaf', tcol: '#5DAE4A',
    pal: { wing: '#5DAE4A', body: '#9B6A3C', dark: '#3E8A3A', ck: '#F4C542', trim: '#7CCB5C' } },
  { id: 'garra', name: 'Garra de Ferro', rar: 'r', how: 'Vencer o Colosso do Raio (chefão 3)', req: { boss: 'laser' }, shot: '#ff7a3a', trail: 'smoke', tcol: '#3a3a3a',
    pal: { wing: '#4A4E55', body: '#C2362B', dark: '#4A4E55', ck: '#F2A33A', trim: '#c9ccd1' } },
  { id: 'geada', name: 'Geada Arcana', rar: 'r', how: 'Vencer o Vórtice (chefão 4)', req: { boss: 'vortex' }, shot: '#9fe6ff', trail: 'snow', tcol: '#e8f8ff',
    pal: { wing: '#8FD8F2', body: '#2F6FB5', dark: '#2F6FB5', ck: '#C9A8FF', trim: '#ffffff' } },
  { id: 'lamina', name: 'Lâmina Dourada', rar: 'e', how: 'Vencer o Aríete (chefão 5)', req: { boss: 'ram' }, shot: '#ffe066', trail: 'spark', tcol: '#F2C230',
    pal: { wing: '#2A55B8', body: '#F4F1E6', dark: '#2A55B8', ck: '#7FD3E8', trim: '#F2C230' } },
  { id: 'vazio', name: 'Sombra do Vazio', rar: 'e', how: 'Vencer o Semeador (chefão 7)', req: { boss: 'sower' }, shot: '#8CF04A', trail: 'flame', tcol: '#8CF04A',
    pal: { wing: '#3a1a5c', body: '#5a2a86', dark: '#2a1240', ck: '#8CF04A', trim: '#8CF04A' } },
  { id: 'espectro', name: 'Espectro Ósseo', rar: 'e', how: 'Vencer o Fantasma (chefão 8)', req: { boss: 'ghost' }, shot: '#7CF5C8', trail: 'mist', tcol: '#7CF5C8',
    pal: { wing: '#7CF5C8', body: '#EDE3C8', dark: '#cfc4a6', ck: '#7CF5C8', trim: '#EDE3C8' } },
  { id: 'dragao', name: 'Brasa do Dragão', rar: 'l', how: 'Vencer a Tempestade (chefão 10)', req: { boss: 'storm' }, shot: '#ff8a2a', trail: 'ember', tcol: '#FF9A2E',
    pal: { wing: '#7a1610', body: '#B8231A', dark: '#7a1610', ck: '#FFE14D', trim: '#FFC23D' } },
];
function skinById(id) { return SKINS.find(s => s.id === id) || SKINS[0]; }
