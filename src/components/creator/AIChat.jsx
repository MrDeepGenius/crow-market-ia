import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, Bot, Zap, AlertCircle } from "lucide-react";

const SYSTEM_PROMPT =
  "Eres NexBot, el asistente de IA de NexTrade AI. Ayudas a creadores y afiliados con bots de trading, estrategias, indicadores, configuraciones tecnicas y dudas de la plataforma. Se claro, conciso y profesional. No des asesoramiento financiero.";

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(user?.ai_credits ?? 0);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    setCredits(user?.ai_credits ?? 0);
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("aiChat", {
        messages: next,
        systemPrompt: SYSTEM_PROMPT,
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
      if (typeof res.remaining === "number") setCredits(res.remaining);
    } catch (err) {
      setError(err?.message || "No se pudo obtener respuesta de la IA.");
      if (err?.status === 402) setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  const noCredits = credits <= 0;
  const suggestions = [
    "¿Qué es un bot de grid trading?",
    "¿Cómo configuro un stop loss?",
    "Explica el indicador RSI",
    "¿Qué timeframe usar para scalping?",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl">Asistente IA</h2>
            <p className="text-xs text-muted-foreground">Claude Sonnet 4.6 · tu copiloto de trading</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${noCredits ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Zap className="w-4 h-4" />
          {credits} {credits === 1 ? "mensaje" : "mensajes"}
        </div>
      </div>

      <div className="glass rounded-2xl flex flex-col h-[60vh] min-h-[420px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <p className="font-semibold">¿En qué puedo ayudarte?</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Pregúntame sobre bots de trading, estrategias, indicadores o cómo usar la plataforma.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-5 w-full max-w-md">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-left text-xs px-3 py-2.5 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 hover:bg-secondary transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-secondary" : "bg-primary/15"}`}>
                {m.role === "user" ? <Bot className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/60 border border-border"}`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary/60 border border-border rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Pensando...</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {noCredits && (
          <div className="mx-4 mb-3 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Sin créditos disponibles</p>
              <p className="text-xs text-muted-foreground">Recarga 1.000 mensajes por $5 y sigue conversando con la IA.</p>
            </div>
            <Button size="sm" className="shrink-0"><Zap className="w-4 h-4 mr-1" />Recargar</Button>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={noCredits ? "Recarga para continuar..." : "Escribe tu mensaje..."}
              disabled={loading || noCredits}
              className="h-11 bg-secondary/50 border-border"
            />
            <Button onClick={send} disabled={loading || !input.trim() || noCredits} className="h-11 px-4">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}