/* =========================================================
   BLOQUE MAESTRO · Datos
   El contenido vive en assets/content.js (lo edita el panel /admin).
   Aquí solo se preparan los datos para las páginas.
   ========================================================= */
window.BM = window.BM || {};
(() => {
const C = BM.C = window.BM_CONTENT;

/* Imagen: id de Unsplash ("photo-…"), URL completa o ruta subida desde el panel (assets/uploads/…) */
BM.img = (src, w = 800, h = 600) => !src ? '' : /^photo-/.test(src)
  ? `https://images.unsplash.com/${src}?w=${w}&h=${h}&fit=crop&auto=format&q=72` : src;

/* Secciones del menú "Explora" */
BM.CATS = C.cats;
BM.CAT_COLOR = Object.fromEntries(C.cats.map(c => [c.id, c.color]));
BM.STATUS = { obra: ['En obra', 'st-obra'], fin: ['Finalizado', 'st-fin'], dis: ['En diseño', 'st-dis'] };

/* Proyectos publicados (los ocultos desde el panel no aparecen) */
const initials = s => s.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase();
BM.PROJECTS = C.projects.filter(p => !p.hidden).map(p => ({
  ...p, pub: new Date(p.pub + 'T12:00'),
  owner: { ...p.owner, initials: p.owner.initials || initials(p.owner.name) },
}));
BM.byId = id => BM.PROJECTS.find(p => p.id === id);
BM.catName = id => (BM.CATS.find(c => c.id === id) || {}).name || id;
BM.PROJECTS_BY_DATE = [...BM.PROJECTS].sort((a, b) => b.pub - a.pub);
})();
