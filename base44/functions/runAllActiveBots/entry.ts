import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { executeTick } from '../../shared/botTick.js';

// =============================================================================
// Punto de entrada del workflow programado (cada 5 min).
// Lista todas las BotInstance con status=running y ejecuta un tick para cada una
// de forma segura (lock por instancia). Si una falla, continua con las demas.
// No requiere usuario: corre con service role.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const instances = await base44.asServiceRole.entities.BotInstance.filter(
      { status: "running" }, "-created_date", 500
    );
    const results = [];
    for (const inst of (instances || [])) {
      try {
        const r = await executeTick({ base44, instance: inst });
        results.push(r);
      } catch (e) {
        results.push({ instance_id: inst.id, error: e.message });
      }
    }
    const processed = results.length;
    const locked = results.filter((r) => r.skipped === "locked").length;
    const errors = results.filter((r) => r.error).length;
    return Response.json({ success: true, processed, locked, errors, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}