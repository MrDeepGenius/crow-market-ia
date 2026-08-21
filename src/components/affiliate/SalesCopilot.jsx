import React, { useState } from "react";
import { Bot, Sparkles, Instagram, MessageSquare, FileText, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

const QUICK_ACTIONS = [
  { label: "Generar Copy Instagram/TikTok", icon: Instagram, prompt: "Escribe un copy persuasivo para Instagram/TikTok promocionando un bot de trading de Crow Market." },
  { label: "Responder Objeciones de Venta", icon: MessageSquare, prompt: "Dame respuestas a las objeciones más comunes al vender bots de trading con IA." },
  { label: "Crear Script de Persuasión", icon: FileText, prompt: "Crea un script de venta persuasivo para un afiliado que promueve bots de trading automatizados." },
];

export default function SalesCopilot() {
  const { user } = useAuth();
  const credits = Number(user?.ai_credits || 0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const runPrompt = async (promptText) => {
    if (credits <= 0) {
      toast({ variant: "destructive", title: "Sin créditos IA", description: "Recarga créditos para usar el copiloto." });
      return;
    }
    setLoading(true);
    const userMsg = { role: "user", text: promptText };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    try {
      const res = await base44.functions.invoke("aiChat", {
        messages: [{ role: "user", content: promptText }],
        systemPrompt:
          "Eres el Copiloto IA de Ventas de Crow Market, plataforma de bots de trading con IA. Ayudas a afiliados a generar copys persuasivos, responder objeciones de venta y crear scripts. Sé conciso, persuasivo y profesional. No des asesoramiento financiero.",
      });
      setMessages((m) => [...m, { role: "ai", text: res.reply }]);
      if (typeof res.remaining === "number") {
        // el backend ya debitó el crédito; refrescar contexto de auth para reflejarlo
        window.dispatchEvent(new Event("ai-credits-updated"));
      }
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "No pude generar una respuesta en este momento. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel className="relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,hsl(190_90%_55%_/_0.15),transparent_60%)] blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/30 to-violet-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-semibold">Copiloto IA de Ventas</h3>
              <p className="text-xs text-muted-foreground">Asistente IA para afiliados</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {credits} mensajes gratis
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Button
                key={a.label}
                size="sm"
                variant="outline"
                className="bg-transparent border-border"
                disabled={loading}
                onClick={() => runPrompt(a.prompt)}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" /> {a.label}
              </Button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-secondary/20 p-3 h-56 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 text-center">
              <Sparkles className="w-6 h-6 text-primary" />
              <p className="text-sm">Pídele copy, respuestas a objeciones o scripts de venta.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 border border-border"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary/60 border border-border rounded-2xl px-3.5 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>

        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) runPrompt(input.trim());
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu solicitud al copiloto..."
            className="flex-1 h-11 rounded-xl bg-secondary/50 border border-border px-4 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" className="h-11 px-4" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Panel>
  );
}