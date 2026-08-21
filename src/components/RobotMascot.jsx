import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

const ROBOT_URL =
  "https://media.base44.com/images/public/user_6a87bc4561ec69e23866d03e/b4c4a65c6_ChatGPTImage21ago202600_31_24.png";

export default function RobotMascot({ size = "md", wave = true }) {
  const dims = {
    sm: "w-40 h-40",
    md: "w-64 h-64",
    lg: "w-80 h-80",
    xl: "w-[22rem] h-[22rem]",
  }[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Radial glow behind */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,hsl(276_91%_60%_/_0.45),transparent_65%)] blur-2xl animate-pulse-glow" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,hsl(290_90%_55%_/_0.25),transparent_60%)] blur-3xl" />

      {/* Rotating ring */}
      <div className="absolute inset-[-8%] rounded-full border border-primary/20 animate-[spin_18s_linear_infinite]" />
      <div className="absolute inset-[-2%] rounded-full border border-dashed border-primary/15 animate-[spin_26s_linear_infinite_reverse]" />

      <motion.div
        className={`relative ${dims}`}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="w-full h-full"
          animate={
            wave
              ? { rotate: [0, -3, 3, -2, 0], y: [0, -8, 0] }
              : { y: [0, -8, 0] }
          }
          transition={{
            duration: wave ? 2.4 : 5,
            repeat: wave ? 0 : Infinity,
            repeatDelay: wave ? 0 : 0.5,
            ease: "easeInOut",
            delay: wave ? 0.4 : 0,
          }}
        >
          <Image
            src={ROBOT_URL}
            alt="Asistente de IA NEXUS"
            className="w-full h-full object-contain drop-shadow-[0_0_40px_hsl(276_91%_60%_/_0.5)]"
            fittingType="fit"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}