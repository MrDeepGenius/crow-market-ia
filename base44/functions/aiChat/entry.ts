import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Chat con IA — Sistema de créditos.
// Modelo: Claude (Anthropic) vía InvokeLLM.
// 1 crédito = 1 mensaje. 30 gratis al registrarse. Recarga: $5 = 1.000 mensajes.
// =============================================================================

const CLAUDE_MODEL = "claude_sonnet_4_6";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const systemPrompt = (body?.systemPrompt || '').toString().trim();

    if (messages.length === 0) {
      return Response.json({ error: 'Se requiere al menos un mensaje.' }, { status: 400 });
    }

    // Validar tamaño razonable del historial.
    const totalChars = messages.reduce((s, m) => s + (m?.content || '').length, 0);
    if (totalChars > 12000) {
      return Response.json({ error: 'El historial es demasiado largo (máx. 12.000 caracteres).' }, { status: 400 });
    }

    const credits = Number(user.ai_credits || 0);
    if (credits <= 0) {
      return Response.json({
        error: 'Sin créditos de IA. Recarga para continuar.',
        credits: 0,
      }, { status: 402 });
    }

    // Descontar 1 crédito de forma atómica (solo si tiene saldo).
    await base44.asServiceRole.entities.User.updateMany(
      { id: user.id, ai_credits: { $gte: 1 } },
      { $inc: { ai_credits: -1 } }
    );

    // Construir el prompt a partir del historial de conversación.
    const conversation = messages
      .map((m) => `${m.role === 'assistant' ? 'Asistente' : 'Usuario'}: ${m.content}`)
      .join('\n');

    const prompt = systemPrompt
      ? `${systemPrompt}\n\n${conversation}\nAsistente:`
      : `${conversation}\nAsistente:`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: CLAUDE_MODEL,
    });

    return Response.json({
      reply: typeof result === 'string' ? result : JSON.stringify(result),
      remaining: credits - 1,
      model: CLAUDE_MODEL,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}