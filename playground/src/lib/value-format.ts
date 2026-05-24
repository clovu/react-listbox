export function formatValue(value: string | string[]) {
  return Array.isArray(value)
    ? value.length > 0
      ? value.join(', ')
      : 'none'
    : value || 'none'
}
