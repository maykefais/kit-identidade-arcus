// Paleta de séries validada pelo validador da skill dataviz (claro sobre #FFFCF6, escuro sobre #28233F):
// só azul e flame passam juntos (flame e âmbar se confundem para daltônicos). Por isso, no máximo 2 séries
// por gráfico; meta, tendência e comparação vão em tracejado neutro. Nunca ciclar cores nem usar 2 eixos Y.
export const CORES_SERIES = ["var(--chart-1)", "var(--chart-2)"] as const;
export const COR_REFERENCIA = "var(--muted-foreground)";
