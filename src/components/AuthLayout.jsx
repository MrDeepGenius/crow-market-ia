import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";

const ROBOT_URL =
  "https://media.base44.com/images/public/6a87c70aaf7f69d145da0bdf/20b721461_ChatGPTImage21ago202600_31_24.png";

/**
 * Premium split auth layout.
 * variant="robot" -> robot image as a full-bleed background on the left, form on the right.
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
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
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

      {/* Left: robot as full-bleed background */}
      <div className="relative z-10 hidden lg:block overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={ROBOT_URL}
            alt="Asistente de IA NEXUS"
            className="w-full h-full"
            fittingType="fill"
          />
        </div>
        {/* violet ambient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,hsl(276_91%_55%_/_0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80" />
        <div className="absolute inset-0 grid-bg opacity-20" />

        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <div className="flex items-center justify-between">
            <BrandLogo size="lg" to="/" wordClass="text-white" />
            <ThemeToggle />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="max-w-sm"
          >
            {robotCaption && (
              <p className="text-white/90 text-lg font-medium leading-relaxed">
                {robotCaption}
              </p>
            )}
            <p className="mt-3 text-sm text-white/60">
              IA · Trading · Creadores · Afiliados
            </p>
          </motion.div>

          <div className="text-xs text-white/50">
            © 2026 CrowMarket · Infraestructura tecnológica para creadores y afiliados
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="relative z-10 flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="absolute top-4 right-4 lg:hidden">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <BrandLogo size="md" to="/" className="lg:hidden mb-8" />

          {/* compact robot on mobile */}
          <div className="lg:hidden mb-8 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-40 h-40 rounded-3xl overflow-hidden border border-primary/20"
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,hsl(276_91%_60%_/_0.45),transparent_65%)] blur-2xl animate-pulse-glow" />
              <Image
                src={ROBOT_URL}
                alt="Asistente de IA NEXUS"
                className="relative w-full h-full object-contain drop-shadow-[0_0_30px_hsl(276_91%_60%_/_0.5)]"
                fittingType="fit"
              />
            </motion.div>
          </div>

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
  return <BrandLogo size="lg" to="/" className={className} />;
}