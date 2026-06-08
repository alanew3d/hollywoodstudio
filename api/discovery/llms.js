import { setCors, handleOptions } from '../_lib/cors.js';

const SUMMARY = `# Hollywood Studio AI
> Plataforma de workflow audiovisual com IA — da ideia ao corte final.

## O que é
Estúdio web que conecta prompt, referências, modelos, templates, galeria, pós-produção e redes sociais.

## Público
Criadores, agências, produtoras, social media, filmmakers que usam IA generativa.

## Áreas principais
- Studio (geração vídeo/imagem/áudio)
- Modelos (Seedance, Kling, Veo, Sora, Flux, etc.)
- Templates por nicho
- Galeria e Galeria Pública
- Conselho Criativo
- Pós-Produção
- Planos e créditos

## URL
https://hollywoodstudio.ai
`;

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  if (req.method === 'GET' && req.headers.accept?.includes('text/plain')) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(SUMMARY);
  }

  return res.status(200).json({ ok: true, summary: SUMMARY, staticFile: '/llms.txt' });
}
