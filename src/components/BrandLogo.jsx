import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

const LOGO_URL =
  "https://media.base44.com/images/public/6a87c70aaf7f69d145da0bdf/cdb862ec8_ChatGPTImage21ago202600_37_47.png";

const SIZES = {
  sm: "w-9 h-9",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
  "2xl": "w-24 h-24",
  "3xl": "w-32 h-32",
};

const WORD_SIZE = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
  "2xl": "text-3xl sm:text-4xl",
  "3xl": "text-4xl sm:text-5xl",
};

export default function BrandLogo({
  size = "sm",
  showWord = true,
  to = "/",
  className = "",
  wordClass = "",
}) {
  const emblem = (
    <div className={`relative ${SIZES[size]} shrink-0`}>
      <div className="absolute -inset-1 rounded-full bg-[radial-gradient(circle_at_center,hsl(276_91%_60%_/_0.5),transparent_70%)] blur-lg animate-pulse-glow" />
      <Image
        src={LOGO_URL}
        alt="CrowMarket"
        className="relative w-full h-full rounded-full overflow-hidden ring-1 ring-primary/30"
        fittingType="fill"
      />
    </div>
  );

  const word = showWord && (
    <span
      className={`font-heading font-extrabold tracking-tight leading-none ${WORD_SIZE[size]} ${wordClass}`}
    >
      CROW<span className="text-primary"> MARKET</span>
    </span>
  );

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {emblem}
      {word}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center">
        {content}
      </Link>
    );
  }
  return content;
}