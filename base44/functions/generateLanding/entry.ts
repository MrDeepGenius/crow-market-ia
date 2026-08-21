import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Generar contenido de landing page con IA a partir del nombre del producto.
// Devuelve titulo, subtitulo, beneficios, pasos y CTA listos para publicar.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const productName = (body?.productName || '').toString().trim();
    const productDescription = (body?.productDescription || '').toString().trim();
    const category = (body?.category || '').toString().trim();

    if (!productName) {
      return Response.json({ error: 'Falta el nombre del producto.' }, { status: 400 });
    }

    const prompt = `Eres un copywriter experto en conversión para productos de trading con IA. Genera el contenido de una landing page básica pero profesional en español para el siguiente producto.

Producto: ${productName}
Categoría: ${category}
Descripción: ${productDescription}

Incluye: un título principal persuasivo, un subtítulo de apoyo, 3 beneficios clave (frases cortas), 3 pasos de "cómo funciona" (cada uno con título y descripción breve) y el texto del botón de llamada a la acción (CTA). Tono profesional, enfocado en trading automatizado con IA.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          benefits: { type: "array", items: { type: "string" } },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                desc: { type: "string" }
              },
              required: ["title", "desc"]
            }
          },
          cta: { type: "string" }
        },
        required: ["title", "subtitle", "benefits", "steps", "cta"]
      }
    });

    return Response.json({ landing: result });
  } catch (error) {
    console.error('generateLanding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}