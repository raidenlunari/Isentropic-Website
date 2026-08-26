const FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(d: Date): string {
  return FORMATTER.format(d);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
