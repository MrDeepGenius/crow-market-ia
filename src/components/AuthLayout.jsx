import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import RobotMascot from "@/components/RobotMascot";

/**
 * Premium split auth layout.
 * variant="robot" -> robot mascot on the left, form on the right (login/register).
 * variant="center" -> centered glass card (forgot/reset).
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  variant = "robot",
  robotCaption,
}) {
  if (variant === "center") {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
        <Backdrop />
        <div className="relative z-10 w-full max-w-md">
          <BrandMark className="mb-8" />
          <div className="glass-strong rounded-3xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden">
      <Backdrop />

      {/* Left: robot + brand */}
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center glow-violet">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">NEXUS</span>
        </Link>

        <div className="flex flex-col items-center justify-center flex-1 -mt-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <RobotMascot size="xl" />
          </motion.div>
          {robotCaption && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center text-muted-foreground text-sm max-w-xs"
            >
              {robotCaption}
            </motion.p>
          )}
        </div>

        <div className="text-xs text-muted-foreground/70">
          © 2026 NEXUS · Infraestructura tecnológica para creadores y afiliados
        </div>
      </div>

      {/* Right: form */}
      <div className="relative z-10 flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center glow-violet">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">NEXUS</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-3xl font-bold tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-3 text-[15px]">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </motion.div>

          {footer && <p className="text-sm text-muted-foreground mt-8">{footer}</p>}
        </div>
      </div>
    </div>
  );
}

function Backdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -top-1/4 -left-1/4 w-[60rem] h-[60rem] rounded-full bg-[radial-gradient(circle,hsl(276_91%_55%_/_0.22),transparent_60%)] blur-3xl" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle,hsl(300_80%_50%_/_0.18),transparent_60%)] blur-3xl" />
    </>
  );
}

function BrandMark({ className = "" }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center glow-violet">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className="font-heading font-bold text-xl tracking-tight">NEXUS</span>
    </Link>
  );
}