// Utilitários para API e Helpers
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Labels para o enum
export const REASON_LABELS: Record<string, string> = {
  ESQUECIMENTO: "Esquecimento",
  SISTEMA_INDISPONIVEL: "Sistema Indisponível",
  COMPENSACAO_DE_HORAS: "Compensação de Horas",
  ATESTADO_MEDICO: "Atestado Médico",
  AJUSTE: "Outro Ajuste"
};