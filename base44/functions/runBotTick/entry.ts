import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { executeTick } from '../../shared/botTick.js';

// =============================================================================
// Tick manual de una instancia (admin / "Evaluar ahora" futuro).
// Reusa el nucleo compartido botTick.js (mismo lock, idempotencia y circuit
// breaker que el workflow). El frontend de /my-bots YA NO llama a esta funcion:
// la ejecucion automatica la dispara el workflow runAllActiveBots.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const instanceId = body?.instanceId;
    if (!instanceId) return Response.json({ error: 'instanceId requerido.' }, { status: 400 });

    const instance = await base44.entities.BotInstance.get(instanceId);
    if (!instance || instance.user_id !== user.id) {
      return Response.json({ error: 'Instancia no encontrada.' }, { status: 404 });
    }
    if (instance.status !== "running") {
      return Response.json({ skipped: true, reason: 'La instancia no esta corriendo.' });
    }

    const result = await executeTick({ base44, instance });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}