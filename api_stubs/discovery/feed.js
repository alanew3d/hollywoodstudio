import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  return res.status(200).json({
    ok: true,
    status: 'beta',
    feed: { templates: [], demos: [], models: [], tags: [] },
    message: 'Feed de descoberta preparado para Neural Network Layer.',
  });
}
