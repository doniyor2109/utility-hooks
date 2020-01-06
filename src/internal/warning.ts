/* istanbul ignore next */
export function warning(condition: boolean, message: string): void {
  if (!condition || process.env.NODE_ENV === 'production') {
    return;
  }

  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(message);
  }

  try {
    throw new Error(`Warning: ${message}`);
  } catch {}
}
