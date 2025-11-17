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
