import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  return res.status(200).json({
    ok: true,
    status: 'beta',
    items: [],
    message: 'Galeria pública dinâmica preparada. Conteúdo inicial no frontend (localStorage).',
  });
}
