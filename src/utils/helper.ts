import type { UserCompactType } from "../Types/UsersTypes";
export function FormatFileName(name: string, len = 18): string {
  if (!name) return name;
  if (len <= 0) return "";

  // If already short enough, return as-is
  if (name.length <= len) return name;

  const ellipsis = "...";
  const suffixLenDefault = 2; // show last 2 characters of the base before the extension
  const lastDot = name.lastIndexOf(".");

  // Determine base and extension. Ignore leading dot as an extension marker (e.g. ".env")
  let base = name;
  let ext = "";
  if (lastDot > 0) {
    base = name.slice(0, lastDot);
    ext = name.slice(lastDot); // includes the dot, e.g. ".txt"
  }

  // If there's no room for prefix + ellipsis + suffix + ext, fallback to a simple front-truncate
  const extLen = ext.length;
  const availableForBase = len - extLen - ellipsis.length;

  if (availableForBase <= 0) {
    // no space to show ext with ellipsis, just do a front truncation of the full name
    const take = Math.max(0, len - ellipsis.length);
    return name.slice(0, take) + ellipsis;
  }

  // Determine suffix length (at most suffixLenDefault, but not more than base length)
  const suffixLen = Math.min(suffixLenDefault, base.length);

  // If availableForBase is small and can't fit prefix + suffix, show as much prefix as possible and no suffix
  if (availableForBase <= suffixLen) {
    const prefix = base.slice(0, availableForBase);
    return prefix + ellipsis + ext;
  }

  // Otherwise split availableForBase into prefix + suffix
  const prefixLen = availableForBase - suffixLen;
  const prefix = base.slice(0, prefixLen);
  const suffix = base.slice(-suffixLen);

  return `${prefix}${ellipsis}${suffix}${ext}`;
}

export function FormatSize(size: number): string {
  const num = 1024;
  if (size < num) return `${size} bytes`;
  let unit = "byts";
  let n = size;
  if (size > num) {
    n = size / num;
    unit = "kb";
  }
  if (n > num) {
    n = n / num;
    unit = "mb";
  }
  if (n > num) {
    n = n / num;
    unit = "gb";
  }
  if (n > num) {
    n = n / num;
    unit = "tb";
  }
  return `${n.toFixed(2)} ${unit}`;
}

export function CurrentUser() {
  const stored = localStorage.getItem("user_info") || "{}";
  const user: UserCompactType = JSON.parse(stored);
  return user;
}

// format ISO timestamp to friendly string (today/tomorrow or date + time)
export function formatTime(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "just now";
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}h`;
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}
