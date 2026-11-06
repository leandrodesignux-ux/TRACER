export function formatNumber(value: number) {
  return value.toLocaleString("es-CL");
}

export function formatPercent(value: number, digits = 0) {
  return `${(value * 100).toLocaleString("es-CL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

export function formatChange(value: number) {
  if (value === 0) return "0 %";
  return `${value > 0 ? "+" : "−"}${Math.abs(value)} %`;
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes} min ${rest} s` : `${rest} s`;
}
