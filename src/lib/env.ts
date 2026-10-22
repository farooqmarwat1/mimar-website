/** Hosting dashboards may preserve the surrounding quotes copied from .env files. */
export function envValue(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  const first = trimmed[0];
  if ((first === '"' || first === "'") && trimmed.length >= 2 && trimmed.at(-1) === first) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function pemEnvValue(value: string | undefined): string | undefined {
  return envValue(value)?.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}
