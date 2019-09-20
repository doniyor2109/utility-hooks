/* istanbul ignore next */
export function warning(
  condition: boolean,
  format: string,
  args: unknown[],
): void {
  if (!condition || process.env.NODE_ENV === "production") {
    return;
  }

  if (typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.error(format, ...args);
  }

  try {
    let argIndex = 0;

    throw new Error(
      `Warning: ${format.replace(/%s/g, () => args[argIndex++] as string)}`,
    );
  } catch {}
}

const shownDeprecatedMessages: Record<string, true> = {};

/* istanbul ignore next */
export function deprecated(message: string): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (shownDeprecatedMessages[message]) {
    return;
  }

  shownDeprecatedMessages[message] = true;
  warning(false, message, []);
}
