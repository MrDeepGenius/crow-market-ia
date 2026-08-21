import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      /* always show success */
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        variant="center"
        title="Revisa tu correo"
        subtitle="Te enviamos un enlace para crear una nueva contraseña al email proporcionado."
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5 glow-violet">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <Button asChild className="w-full h-12 font-semibold mt-2">
            <Link to="/login">Volver a iniciar sesión</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="center"
      title="Recupera el acceso a tu cuenta"
      subtitle="Ingresa el email con el que registraste tu cuenta y te enviaremos las instrucciones para crear una nueva contraseña."
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Volver a iniciar sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 bg-secondary/50 border-border"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-semibold group" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
            </>
          ) : (
            <>
              Enviar instrucciones
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}