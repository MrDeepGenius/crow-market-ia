// =============================================================================
// Sistema de correos transaccionales via Resend.
// Compartido por todas las funciones backend que necesiten enviar emails.
// Requiere el secret RESEND_API_KEY.
// =============================================================================

const FROM = "Crow Market <noreply@crowmarket.ai>";

function shell(title, bodyHtml) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;background:#0b0b12;color:#e9e9f5;padding:32px;border-radius:18px;border:1px solid #2a1a4a">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
      <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#a855f7)"></div>
      <span style="font-weight:700;letter-spacing:-0.02em">Crow Market</span>
    </div>
    <h2 style="color:#c4a6ff;margin:0 0 16px;font-size:20px">${title}</h2>
    <div style="font-size:14px;line-height:1.6;color:#d6d6ea">${bodyHtml}</div>
    <p style="font-size:11px;color:#5a5a78;margin-top:26px;border-top:1px solid #2a1a4a;padding-top:16px">Crow Market IA · Mensaje automatico, no responder.</p>
  </div>`;
}

function row(label, value) {
  return `<div style="display:flex;justify-content:space-between;padding:7px 0"><span style="color:#9a9ab5">${label}</span><span style="font-weight:600;text-align:right">${value}</span></div>`;
}

export const TEMPLATES = {
  welcome: ({ name }) => ({
    subject: "🎉 Bienvenido a Crow Market",
    html: shell("¡Bienvenido a Crow Market!", `
      <p>Hola ${name || ""},</p>
      <p>¡Bienvenido a Crow Market!<br>Tu cuenta fue creada correctamente.</p>
      <p>Ya puedes acceder a:</p>
      <p>✅ Marketplace<br>✅ Creator Studio<br>✅ Affiliate Hub</p>
      <p>Ingresar:<br><a href="https://crowmarket.ai" style="color:#a855f7">https://crowmarket.ai</a></p>
      <p>Gracias por formar parte de Crow Market.</p>`),
  }),

  purchaseConfirmed: ({ buyerName, productName, price, orderId, date }) => ({
    subject: "✅ Compra confirmada",
    html: shell("Compra confirmada", `
      <p>Hola ${buyerName || ""},</p>
      <p>Tu compra fue confirmada correctamente.</p>
      ${row("Producto", productName || "-")}
      ${row("Precio", price ? `${price} USDT` : "-")}
      ${row("Orden", orderId ? `#${String(orderId).slice(0, 8)}` : "-")}
      ${row("Fecha", date || "-")}
      <p style="margin-top:16px">Ya puedes acceder a tu producto desde tu panel.</p>
      <p>Gracias por confiar en Crow Market.</p>`),
  }),

  receipt: ({ buyerName, orderId, product, price }) => ({
    subject: "🧾 Recibo de compra",
    html: shell("Recibo de compra", `
      <p>Hola ${buyerName || ""},</p>
      <p>Adjuntamos el resumen de tu compra.</p>
      ${row("Orden", orderId ? `#${String(orderId).slice(0, 8)}` : "-")}
      ${row("Producto", product || "-")}
      ${row("Monto", price ? `${price} USDT` : "-")}
      ${row("Estado", "Pagado")}
      <p style="margin-top:16px">Muchas gracias.</p>`),
  }),

  withdrawalApproved: ({ name, amount, wallet }) => ({
    subject: "💸 Retiro aprobado",
    html: shell("Retiro aprobado", `
      <p>Hola ${name || ""},</p>
      <p>Tu retiro fue aprobado.</p>
      ${row("Monto", amount ? `${amount} USDT` : "-")}
      ${row("Wallet", wallet ? String(wallet).slice(0, 12) + "…" : "-")}
      ${row("Estado", "Enviado")}
      <p style="margin-top:16px">Gracias.</p>`),
  }),

  newCommission: ({ product, commission }) => ({
    subject: "🤝 Nueva comisión",
    html: shell("Nueva comisión", `
      <p>¡Felicitaciones!</p>
      <p>Has generado una nueva comisión.</p>
      ${row("Producto", product || "-")}
      ${row("Comisión", commission ? `${commission} USDT` : "-")}
      <p style="margin-top:16px">Ya puedes verla en tu panel.</p>`),
  }),

  passwordReset: ({ name, resetLink }) => ({
    subject: "🔐 Recuperar contraseña",
    html: shell("Recuperar contraseña", `
      <p>Hola ${name || ""}</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña.</p>
      <p><a href="${resetLink || ""}" style="color:#a855f7">${resetLink || ""}</a></p>
      <p>Este enlace vence en 30 minutos.</p>`),
  }),
};

export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Falta RESEND_API_KEY");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function sendTemplate(to, templateName, vars = {}) {
  const t = TEMPLATES[templateName];
  if (!t) throw new Error(`Plantilla desconocida: ${templateName}`);
  const { subject, html } = t(vars);
  return sendEmail({ to, subject, html });
}