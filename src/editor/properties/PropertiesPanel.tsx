/**
 * Painel de propriedades (seção 6.2): ao selecionar um objeto livre, o painel
 * lateral troca de comentários para as propriedades do objeto. Edita cor,
 * espessura, opacidade, ponta da seta, tamanho/alinhamento de texto e a
 * posição numérica — esta última é a alternativa por teclado ao arraste
 * (seção 12.2). Toda edição é um comando reversível.
 */

import { ANNOTATION_PALETTE, TEXT_SIZES } from '../../domain/constants'
import type {
  Annotation,
  AreaAnnotation,
  ArrowAnnotation,
  TextAnnotation,
} from '../../domain/types'
import { annotationTypeLabel } from '../../domain/describe'
import { annotationExtent, moveAnnotation } from '../tools/tools'
import './PropertiesPanel.css'

interface PropertiesPanelProps {
  annotation: Annotation
  onChange(next: Annotation, label?: string): void
  onDelete(): void
}

function withStyle<T extends { style: object }>(
  annotation: T,
  patch: Partial<T['style']>,
): T {
  // Cast necessário: o TS não prova que o objeto reconstruído continua no
  // mesmo membro da união discriminada, embora o `type` seja preservado.
  return { ...annotation, style: { ...annotation.style, ...patch } } as T
}

export function PropertiesPanel({
  annotation,
  onChange,
  onDelete,
}: PropertiesPanelProps) {
  return (
    <section className="properties-panel" aria-label="Propriedades do objeto">
      <h2 className="properties-panel__title">
        {annotationTypeLabel(annotation.type)}
      </h2>

      <PositionFields annotation={annotation} onChange={onChange} />

      <ColorField
        value={annotation.style.color}
        onSelect={(color) => onChange(withStyle(annotation, { color }), 'Cor')}
      />

      {annotation.type === 'area' && (
        <AreaFields annotation={annotation} onChange={onChange} />
      )}
      {annotation.type === 'arrow' && (
        <ArrowFields annotation={annotation} onChange={onChange} />
      )}
      {annotation.type === 'draw' && (
        <StrokeField
          value={annotation.style.strokeWidth}
          onChange={(strokeWidth) =>
            onChange(withStyle(annotation, { strokeWidth }), 'Espessura')
          }
        />
      )}
      {annotation.type === 'text' && (
        <TextFields annotation={annotation} onChange={onChange} />
      )}

      <button
        type="button"
        className="properties-panel__delete"
        onClick={onDelete}
      >
        Excluir objeto
      </button>
    </section>
  )
}

function PositionFields({
  annotation,
  onChange,
}: {
  annotation: Annotation
  onChange(next: Annotation, label?: string): void
}) {
  const extent = annotationExtent(annotation)
  const xPct = Math.round(extent.minX * 100)
  const yPct = Math.round(extent.minY * 100)

  function moveTo(axis: 'x' | 'y', pct: number) {
    const target = Math.min(100, Math.max(0, pct)) / 100
    const dx = axis === 'x' ? target - extent.minX : 0
    const dy = axis === 'y' ? target - extent.minY : 0
    onChange(moveAnnotation(annotation, dx, dy), 'Mover objeto')
  }

  return (
    <fieldset className="properties-panel__group">
      <legend>Posição (% da imagem)</legend>
      <label className="properties-panel__field">
        X
        <input
          type="number"
          min={0}
          max={100}
          value={xPct}
          onChange={(e) => moveTo('x', Number(e.target.value))}
        />
      </label>
      <label className="properties-panel__field">
        Y
        <input
          type="number"
          min={0}
          max={100}
          value={yPct}
          onChange={(e) => moveTo('y', Number(e.target.value))}
        />
      </label>
    </fieldset>
  )
}

function ColorField({
  value,
  onSelect,
}: {
  value: string
  onSelect(color: string): void
}) {
  return (
    <fieldset className="properties-panel__group">
      <legend>Cor</legend>
      <div className="properties-panel__swatches">
        {ANNOTATION_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            className="properties-panel__swatch"
            style={{ backgroundColor: color }}
            aria-label={`Cor ${color}`}
            aria-pressed={value.toLowerCase() === color.toLowerCase()}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
    </fieldset>
  )
}

function StrokeField({
  value,
  onChange,
}: {
  value: number
  onChange(strokeWidth: number): void
}) {
  return (
    <label className="properties-panel__field">
      Espessura
      <input
        type="number"
        min={1}
        max={20}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
      />
    </label>
  )
}

function AreaFields({
  annotation,
  onChange,
}: {
  annotation: AreaAnnotation
  onChange(next: Annotation, label?: string): void
}) {
  return (
    <>
      <StrokeField
        value={annotation.style.strokeWidth}
        onChange={(strokeWidth) =>
          onChange(withStyle(annotation, { strokeWidth }), 'Espessura')
        }
      />
      <label className="properties-panel__field">
        Opacidade
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={annotation.style.opacity}
          onChange={(e) =>
            onChange(
              withStyle(annotation, { opacity: Number(e.target.value) }),
              'Opacidade',
            )
          }
        />
      </label>
    </>
  )
}

function ArrowFields({
  annotation,
  onChange,
}: {
  annotation: ArrowAnnotation
  onChange(next: Annotation, label?: string): void
}) {
  return (
    <>
      <StrokeField
        value={annotation.style.strokeWidth}
        onChange={(strokeWidth) =>
          onChange(withStyle(annotation, { strokeWidth }), 'Espessura')
        }
      />
      <label className="properties-panel__field">
        Ponta
        <select
          value={annotation.style.head}
          onChange={(e) =>
            onChange(
              withStyle(annotation, {
                head: e.target.value as ArrowAnnotation['style']['head'],
              }),
              'Ponta da seta',
            )
          }
        >
          <option value="standard">Com ponta</option>
          <option value="none">Sem ponta</option>
        </select>
      </label>
    </>
  )
}

function TextFields({
  annotation,
  onChange,
}: {
  annotation: TextAnnotation
  onChange(next: Annotation, label?: string): void
}) {
  return (
    <>
      <label className="properties-panel__field">
        Texto
        <input
          type="text"
          value={annotation.text}
          onChange={(e) =>
            onChange({ ...annotation, text: e.target.value }, 'Texto')
          }
        />
      </label>
      <fieldset className="properties-panel__group">
        <legend>Tamanho</legend>
        <div className="properties-panel__segmented">
          <button
            type="button"
            aria-pressed={annotation.style.fontSize === TEXT_SIZES.small}
            onClick={() =>
              onChange(
                withStyle(annotation, { fontSize: TEXT_SIZES.small }),
                'Tamanho do texto',
              )
            }
          >
            Pequeno
          </button>
          <button
            type="button"
            aria-pressed={annotation.style.fontSize === TEXT_SIZES.large}
            onClick={() =>
              onChange(
                withStyle(annotation, { fontSize: TEXT_SIZES.large }),
                'Tamanho do texto',
              )
            }
          >
            Grande
          </button>
        </div>
      </fieldset>
      <fieldset className="properties-panel__group">
        <legend>Alinhamento</legend>
        <div className="properties-panel__segmented">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              type="button"
              aria-pressed={annotation.style.align === align}
              onClick={() =>
                onChange(withStyle(annotation, { align }), 'Alinhamento')
              }
            >
              {align === 'left'
                ? 'Esquerda'
                : align === 'center'
                  ? 'Centro'
                  : 'Direita'}
            </button>
          ))}
        </div>
      </fieldset>
    </>
  )
}
