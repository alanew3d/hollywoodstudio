import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  return res.status(200).json({
    ok: true,
    status: 'beta',
    models: [],
    message: 'Catálogo de modelos público preparado para API dinâmica.',
  });
}
