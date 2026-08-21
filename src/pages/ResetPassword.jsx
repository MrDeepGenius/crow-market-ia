import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Check } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const rules = [
    { label: "Mínimo 8 caracteres", ok: newPassword.length >= 8 },
    { label: "Al menos una letra", ok: /[a-zA-Z]/.test(newPassword) },
    { label: "Al menos un número", ok: /\d/.test(newPassword) },
    { label: "Caracteres especiales (recomendado)", ok: /[^a-zA-Z0-9]/.test(newPassword) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.message || "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        variant="center"
        title="Enlace inválido"
        subtitle="Este enlace de recuperación falta o es inválido."
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Solicitar un nuevo enlace
          </Link>
        }
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/15 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          El enlace que usaste parece incompleto. Solicita un nuevo email de recuperación.
        </p>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout variant="center" title="Contraseña actualizada correctamente" subtitle="Ya puedes iniciar sesión con tu nueva contraseña.">
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5 glow-violet">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <Button asChild className="w-full h-12 font-semibold">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="center" title="Crea una nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta.">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-11 h-12 bg-secondary/50 border-border"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-11 h-12 bg-secondary/50 border-border"
              required
            />
          </div>
        </div>

        <ul className="space-y-1.5 pt-1">
          {rules.map((r) => (
            <li key={r.label} className="flex items-center gap-2 text-xs">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center ${r.ok ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                <Check className="w-2.5 h-2.5" />
              </span>
              <span className={r.ok ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
            </li>
          ))}
        </ul>

        <Button type="submit" className="w-full h-12 font-semibold group" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              Guardar nueva contraseña
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}