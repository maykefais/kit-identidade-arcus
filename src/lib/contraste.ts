// Razão de contraste WCAG 2.1 entre duas cores #RRGGBB.
function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function razaoContraste(cor1: string, cor2: string): number {
  const [a, b] = [luminancia(cor1), luminancia(cor2)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}
