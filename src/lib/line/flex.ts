/**
 * Apply variable substitution to a Flex Message JSON template.
 * Variables look like {{key}} inside any string field.
 */

export type FlexVars = Record<string, string | number | null | undefined>;

export function applyFlexVars<T>(template: T, vars: FlexVars): T {
  const stringified = JSON.stringify(template);
  const replaced = stringified.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => {
    const v = vars[key];
    if (v === null || v === undefined) return "-";
    return escapeJsonString(String(v));
  });
  return JSON.parse(replaced) as T;
}

function escapeJsonString(s: string): string {
  // Re-escape characters that would break the surrounding JSON string literal.
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export function buildFlexMessage(altText: string, contents: unknown) {
  return {
    type: "flex" as const,
    altText,
    contents,
  };
}
