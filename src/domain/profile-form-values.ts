/** All supported profile currencies have two decimal places. */
export function profileRateMinor(value: FormDataEntryValue | null): number | undefined {
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error("invalid_rate");
  const [whole, fraction = ""] = text.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount > 100000000) throw new Error("invalid_rate");
  return amount;
}

export function profileRateDisplay(value: unknown): string {
  return typeof value === "number" && Number.isSafeInteger(value) ? (value / 100).toFixed(2) : "";
}

export function profileCsv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "").split(/[,،]/).map(item => item.trim()).filter(Boolean);
}
