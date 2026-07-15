/**
 * Utilidades de download (RF-065, RF-066). Nomes previsíveis e editáveis,
 * geração e download apenas por ação explícita do usuário.
 */

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Nome-base padrão: margem-AAAA-MM-DD-HHMM (seção 18.1). */
export function defaultBaseName(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = pad(now.getMonth() + 1)
  const d = pad(now.getDate())
  return `margem-${y}-${m}-${d}-${pad(now.getHours())}${pad(now.getMinutes())}`
}

/** Remove caracteres inseguros de um nome de arquivo (RNF-011). */
export function safeFileName(name: string, fallback: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]+/g, '').trim()
  return cleaned === '' ? fallback : cleaned
}

/** Dispara o download de um Blob localmente. */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
