export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2
});

export const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return decimalFormatter.format(value);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}
