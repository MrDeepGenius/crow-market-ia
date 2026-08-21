import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Lista los productos publicados en el marketplace (acceso publico).
// Usa rol de servicio para que funcione sin sesion de usuario.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const rows = await base44.asServiceRole.entities.Product.filter(
      { status: 'published' },
      '-created_date',
      100
    );
    return Response.json({ success: true, products: rows || [] });
  } catch (error) {
    console.error('listPublishedProducts error:', error);
    return Response.json({ success: true, products: [] });
  }
}