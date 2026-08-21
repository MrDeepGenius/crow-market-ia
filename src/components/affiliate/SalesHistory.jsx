import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

const directSales = [
  { id: "V-1042", product: "Apex BTC Pro", buyer: "user@x.com", date: "2026-08-19", amount: "$25.00", commission: "$5.00", status: "Pagada" },
  { id: "V-1041", product: "Funnel AI Pack", buyer: "user@y.com", date: "2026-08-17", amount: "$49.00", commission: "$9.80", status: "Pagada" },
  { id: "V-1040", product: "Neural Scalper", buyer: "user@z.com", date: "2026-08-15", amount: "$39.00", commission: "$7.02", status: "Pendiente" },
];

const rentals = [
  { id: "A-220", product: "Apex BTC Pro", tenant: "user@x.com", since: "2026-08-19", monthly: "$2.50", status: "Activo" },
  { id: "A-219", product: "Grid Master", tenant: "user@w.com", since: "2026-08-10", monthly: "$3.50", status: "Activo" },
  { id: "A-218", product: "Neural Scalper", tenant: "user@z.com", since: "2026-07-28", monthly: "$3.90", status: "Activo" },
];

const withdrawals = [
  { id: "R-055", date: "2026-08-12", amount: "$500.00", method: "USDT TRC20", status: "Completado" },
  { id: "R-054", date: "2026-07-29", amount: "$300.00", method: "USDT TRC20", status: "Completado" },
  { id: "R-053", date: "2026-08-20", amount: "$250.00", method: "USDT TRC20", status: "Procesando" },
];

function Th({ children }) {
  return <th className="font-medium text-xs text-muted-foreground px-2 py-3 text-left">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-2 py-3 ${className}`}>{children}</td>;
}
function StatusPill({ status }) {
  const ok = ["Pagada", "Activo", "Completado"].includes(status);
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ok ? "bg-green-400/15 text-green-400" : "bg-yellow-400/15 text-yellow-400"}`}>
      {status}
    </span>
  );
}

export default function SalesHistory() {
  return (
    <Panel>
      <h3 className="font-semibold mb-4">Historial de Ventas y Recurrencia</h3>
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="direct">Ventas Directas</TabsTrigger>
          <TabsTrigger value="rentals">Alquileres Activos (Residual)</TabsTrigger>
          <TabsTrigger value="wallet">Billetera / Retiros</TabsTrigger>
        </TabsList>

        <TabsContent value="direct">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="border-b border-border">
                <tr>
                  <Th>ID</Th><Th>Producto</Th><Th>Comprador</Th><Th>Fecha</Th><Th>Monto</Th><Th>Comisión</Th><Th>Estado</Th>
                </tr>
              </thead>
              <tbody>
                {directSales.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <Td className="text-muted-foreground">{s.id}</Td>
                    <Td className="font-medium">{s.product}</Td>
                    <Td className="text-muted-foreground">{s.buyer}</Td>
                    <Td className="text-muted-foreground">{s.date}</Td>
                    <Td>{s.amount}</Td>
                    <Td className="text-primary font-semibold">{s.commission}</Td>
                    <Td><StatusPill status={s.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="rentals">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="border-b border-border">
                <tr>
                  <Th>ID</Th><Th>Producto</Th><Th>Inquilino</Th><Th>Desde</Th><Th>Residual / mes</Th><Th>Estado</Th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <Td className="text-muted-foreground">{r.id}</Td>
                    <Td className="font-medium">{r.product}</Td>
                    <Td className="text-muted-foreground">{r.tenant}</Td>
                    <Td className="text-muted-foreground">{r.since}</Td>
                    <Td className="text-primary font-semibold">{r.monthly}</Td>
                    <Td><StatusPill status={r.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="wallet">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="border-b border-border">
                <tr>
                  <Th>ID</Th><Th>Fecha</Th><Th>Monto</Th><Th>Método</Th><Th>Estado</Th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-border/60 last:border-0">
                    <Td className="text-muted-foreground">{w.id}</Td>
                    <Td className="text-muted-foreground">{w.date}</Td>
                    <Td className="font-semibold">{w.amount}</Td>
                    <Td className="text-muted-foreground">{w.method}</Td>
                    <Td><StatusPill status={w.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </Panel>
  );
}