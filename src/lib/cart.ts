import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InquiryLine } from "./types";

type CartState = {
  lines: InquiryLine[];
  add: (line: Omit<InquiryLine, "notes"> & { notes?: string }) => void;
  setQty: (sku: string, quantity: number) => void;
  setNotes: (sku: string, notes: string) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((item) => item.sku === line.sku);
          if (existing) {
            return {
              lines: state.lines.map((item) =>
                item.sku === line.sku
                  ? { ...item, quantity: item.quantity + line.quantity }
                  : item,
              ),
            };
          }
          return {
            lines: [...state.lines, { notes: "", ...line }],
          };
        }),
      setQty: (sku, quantity) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.sku === sku ? { ...item, quantity: Math.max(1, quantity) } : item,
          ),
        })),
      setNotes: (sku, notes) =>
        set((state) => ({
          lines: state.lines.map((item) => (item.sku === sku ? { ...item, notes } : item)),
        })),
      remove: (sku) => set((state) => ({ lines: state.lines.filter((item) => item.sku !== sku) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "hs-timber-inquiry" },
  ),
);
