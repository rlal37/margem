/**
 * Conjunto de ícones em SVG inline (sem dependência externa — coerente com o
 * princípio local/offline). Todos herdam a cor via `currentColor`, são
 * decorativos (`aria-hidden`) e escalam pelo `size`. O nome acessível dos
 * botões vem sempre do texto/`aria-label`, nunca do ícone.
 */

import type { ReactNode } from 'react'

interface IconProps {
  size?: number
  className?: string
}

function Base({
  children,
  size = 20,
  className,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/* --- Ferramentas --- */

export function IconSelect(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M5 3.5 5 18 9.2 14 11.9 19.5 14 18.5 11.3 13 16.5 13 Z"
        fill="currentColor"
        stroke="none"
      />
    </Base>
  )
}

export function IconMarker(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </Base>
  )
}

export function IconArea(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4.5" y="5.5" width="15" height="13" rx="1.5" />
    </Base>
  )
}

export function IconArrow(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 19 18.5 5.5" />
      <path d="M11 5.5h7.5V13" />
    </Base>
  )
}

export function IconDraw(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 20l1-4L16 5a2 2 0 0 1 3 3L8 19l-4 1Z" />
      <path d="M14.5 6.5l3 3" />
    </Base>
  )
}

export function IconText(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 7V5h14v2" />
      <path d="M12 5v14" />
      <path d="M9 19h6" />
    </Base>
  )
}

export function IconPan(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3v18M3 12h18" />
      <path d="M9.5 5.5 12 3l2.5 2.5M9.5 18.5 12 21l2.5-2.5M5.5 9.5 3 12l2.5 2.5M18.5 9.5 21 12l-2.5 2.5" />
    </Base>
  )
}

/* --- Ações da barra superior --- */

export function IconNew(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M12 11.5v6M9 14.5h6" />
    </Base>
  )
}

export function IconExport(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3v12" />
      <path d="M8 11l4 4 4-4" />
      <path d="M5 20h14" />
    </Base>
  )
}

export function IconUndo(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 7 4 12l5 5" />
      <path d="M4 12h10a5 5 0 0 1 0 10H9" />
    </Base>
  )
}

export function IconRedo(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M15 7l5 5-5 5" />
      <path d="M20 12H10a5 5 0 0 0 0 10h5" />
    </Base>
  )
}

export function IconZoomIn(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
      <path d="M11 8.5v5M8.5 11h5" />
    </Base>
  )
}

export function IconZoomOut(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
      <path d="M8.5 11h5" />
    </Base>
  )
}

export function IconFit(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 9V5a1 1 0 0 1 1-1h4" />
      <path d="M20 9V5a1 1 0 0 0-1-1h-4" />
      <path d="M4 15v4a1 1 0 0 0 1 1h4" />
      <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
    </Base>
  )
}

export function IconActual(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M8 21h8M12 17v4" />
    </Base>
  )
}

export function IconHelp(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.6a2.5 2.5 0 0 1 4.8 1c0 1.6-2.3 2-2.3 3.6" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </Base>
  )
}

export function IconAbout(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
    </Base>
  )
}

/* --- Marca --- */

export function Logo(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M7.5 16V9l4.5 4.5L16.5 9v7" />
    </Base>
  )
}
