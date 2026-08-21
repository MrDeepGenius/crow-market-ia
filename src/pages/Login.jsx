import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo, postAuthDestination } from "@/lib/authReturnTo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      let accountType = "creator";
      try {
        const me = await base44.auth.me();
        accountType = me?.account_type || "creator";
      } catch {
        /* fall back to creator */
      }
      window.location.href = postAuthDestination(accountType);
    } catch (err) {
      setError(err.message || "Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", returnTo);

  return (
    <AuthLayout
      variant="robot"
      title="Bienvenido de nuevo."
      subtitle="Tu próxima creación empieza aquí. Inicia sesión para acceder a tu espacio de creador, afiliado y a todas tus herramientas."
      robotCaption="Tu copiloto de IA está listo para acompañarte."
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-5 bg-transparent border-border hover:bg-secondary"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2.5" />
        Continuar con Google
      </Button>

      <Divider />

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-12 bg-secondary/50 border-border"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-semibold text-base group" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground mt-8">
        ¿Todavía no tienes una cuenta?{" "}
        <Link
          to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
          className="text-primary font-semibold hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}

function Divider() {
  return (
    <div className="relative mb-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-widest">
        <span className="bg-card px-3 text-muted-foreground">o</span>
      </div>
    </div>
  );
}