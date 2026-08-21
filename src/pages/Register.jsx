import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Loader2, User, ArrowRight, Palette, Megaphone, Store } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [accountType, setAccountType] = useState(null); // "creator" | "affiliate"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!accepted) {
      setError("Debes aceptar los Términos y Condiciones y la Política de Privacidad");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      try {
        await base44.auth.updateMe({
          first_name: firstName,
          last_name: lastName,
          account_type: accountType || "creator",
        });
      } catch {
        /* non-blocking */
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Código de verificación inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Código enviado", description: "Revisa tu email para el nuevo código." });
    } catch (err) {
      setError(err.message || "No se pudo reenviar el código");
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", safeReturnTo());

  if (showOtp) {
    return (
      <AuthLayout
        variant="center"
        title="Verifica tu email"
        subtitle={`Enviamos un código a ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-semibold" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...
            </>
          ) : (
            "Verificar"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          ¿No recibiste el código?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Reenviar
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="robot"
      title="Crea tu cuenta y comienza a construir"
      subtitle="Únete a la nueva generación de creadores y afiliados impulsados por IA."
      robotCaption="Tu copiloto de IA está listo para acompañarte."
    >
      {/* Account type selector */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">¿Cómo quieres utilizar la plataforma?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TypeCard
            active={accountType === "creator"}
            onClick={() => setAccountType("creator")}
            icon={Palette}
            title="Creador"
            desc="Crear y vender productos, herramientas y bots."
          />
          <TypeCard
            active={accountType === "affiliate"}
            onClick={() => setAccountType("affiliate")}
            icon={Megaphone}
            title="Afiliado"
            desc="Promocionar productos y generar comisiones."
          />
          <TypeCard
            active={accountType === "viewer"}
            onClick={() => setAccountType("viewer")}
            icon={Store}
            title="Ver Marketplace"
            desc="Explorar y comprar productos digitales."
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-5 bg-transparent border-border hover:bg-secondary"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2.5" />
        Continuar con Google
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="bg-card px-3 text-muted-foreground">o</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field id="firstName" label="Nombre" icon={User} value={firstName} onChange={setFirstName} placeholder="Ana" />
          <Field id="lastName" label="Apellido" icon={User} value={lastName} onChange={setLastName} placeholder="Torres" />
        </div>
        <Field id="email" label="Email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="tu@email.com" />
        <Field id="password" label="Contraseña" icon={Lock} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <Field id="confirm" label="Confirmar contraseña" icon={Lock} type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <Checkbox checked={accepted} onCheckedChange={setAccepted} className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
          <span className="text-xs text-muted-foreground leading-relaxed">
            Acepto los <span className="text-primary hover:underline">Términos y Condiciones</span> y la{" "}
            <span className="text-primary hover:underline">Política de Privacidad</span>.
          </span>
        </label>

        <Button type="submit" className="w-full h-12 font-semibold text-base group" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando cuenta...
            </>
          ) : (
            <>
              Crear cuenta
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground mt-8">
        ¿Ya tienes una cuenta?{" "}
        <Link
          to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
          className="text-primary font-semibold hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}

function TypeCard({ active, onClick, icon: Icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition-all ${
        active
          ? "border-primary bg-primary/10 glow-violet"
          : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${active ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
    </button>
  );
}

function Field({ id, label, icon: Icon, type = "text", value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          autoComplete={type === "password" ? "new-password" : "off"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-11 h-12 bg-secondary/50 border-border"
          required
        />
      </div>
    </div>
  );
}