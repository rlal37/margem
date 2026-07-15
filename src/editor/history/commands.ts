/**
 * Comandos concretos do editor. Cada um cobre uma das categorias reversíveis
 * exigidas por RF-050: criação, transformação, estilo, texto, ordem e
 * exclusão. Todos são puros e recapturam o inverso a cada `apply`.
 */

import { reorderComments } from '../../domain/numbering'
import type { Annotation, Comment, Project } from '../../domain/types'
import type { Command } from './command'

function withAnnotations(project: Project, annotations: Annotation[]): Project {
  return { ...project, annotations }
}

function withComments(project: Project, comments: Comment[]): Project {
  return { ...project, comments }
}

/** Criação de anotação livre (RF-022 a RF-025, RF-030). */
export class AddAnnotationCommand implements Command {
  readonly label = 'Adicionar anotação'
  private readonly annotation: Annotation

  constructor(annotation: Annotation) {
    this.annotation = annotation
  }

  apply(project: Project): Project {
    return withAnnotations(project, [...project.annotations, this.annotation])
  }

  revert(project: Project): Project {
    return withAnnotations(
      project,
      project.annotations.filter((a) => a.id !== this.annotation.id),
    )
  }
}

/**
 * Substitui uma anotação pela sua nova versão (mesmo id). Cobre mover,
 * redimensionar, mudar estilo e editar texto (RF-027, RF-028) — o chamador
 * calcula a próxima anotação; o comando cuida da reversão.
 */
export class ReplaceAnnotationCommand implements Command {
  readonly label: string
  private readonly next: Annotation
  private previous: Annotation | undefined

  constructor(next: Annotation, label = 'Editar anotação') {
    this.next = next
    this.label = label
  }

  apply(project: Project): Project {
    this.previous = project.annotations.find((a) => a.id === this.next.id)
    return withAnnotations(
      project,
      project.annotations.map((a) => (a.id === this.next.id ? this.next : a)),
    )
  }

  revert(project: Project): Project {
    const previous = this.previous
    if (!previous) return project
    return withAnnotations(
      project,
      project.annotations.map((a) => (a.id === previous.id ? previous : a)),
    )
  }
}

/** Exclusão de anotação livre (sem comentário). Ver RemoveMarkerCommand. */
export class RemoveAnnotationCommand implements Command {
  readonly label = 'Excluir anotação'
  private readonly annotationId: string
  private removed: Annotation | undefined

  constructor(annotationId: string) {
    this.annotationId = annotationId
  }

  apply(project: Project): Project {
    this.removed = project.annotations.find((a) => a.id === this.annotationId)
    return withAnnotations(
      project,
      project.annotations.filter((a) => a.id !== this.annotationId),
    )
  }

  revert(project: Project): Project {
    const removed = this.removed
    if (!removed) return project
    return withAnnotations(project, [...project.annotations, removed])
  }
}

/**
 * Criação de marcador com comentário vinculado (RF-040). Recebe ambos já
 * construídos e vinculados (ver `createMarkerWithComment`); a ordem do
 * comentário é responsabilidade do chamador.
 */
export class AddMarkerCommand implements Command {
  readonly label = 'Adicionar marcador'
  private readonly annotation: Annotation
  private readonly comment: Comment

  constructor(annotation: Annotation, comment: Comment) {
    this.annotation = annotation
    this.comment = comment
  }

  apply(project: Project): Project {
    return {
      ...project,
      annotations: [...project.annotations, this.annotation],
      comments: [...project.comments, this.comment],
    }
  }

  revert(project: Project): Project {
    return {
      ...project,
      annotations: project.annotations.filter(
        (a) => a.id !== this.annotation.id,
      ),
      comments: project.comments.filter((c) => c.id !== this.comment.id),
    }
  }
}

/**
 * Exclui um marcador e seu comentário em conjunto, de forma reversível
 * (RF-047, CA de desfazer exclusão de marcador vinculado).
 */
export class RemoveMarkerCommand implements Command {
  readonly label = 'Excluir marcador'
  private readonly annotationId: string
  private removedAnnotation: Annotation | undefined
  private removedComment: Comment | undefined

  constructor(annotationId: string) {
    this.annotationId = annotationId
  }

  apply(project: Project): Project {
    const annotation = project.annotations.find(
      (a) => a.id === this.annotationId,
    )
    this.removedAnnotation = annotation
    this.removedComment =
      annotation?.commentId !== undefined
        ? project.comments.find((c) => c.id === annotation.commentId)
        : undefined

    return {
      ...project,
      annotations: project.annotations.filter(
        (a) => a.id !== this.annotationId,
      ),
      comments: project.comments.filter(
        (c) => c.id !== this.removedComment?.id,
      ),
    }
  }

  revert(project: Project): Project {
    const annotation = this.removedAnnotation
    if (!annotation) return project
    return {
      ...project,
      annotations: [...project.annotations, annotation],
      comments: this.removedComment
        ? [...project.comments, this.removedComment]
        : project.comments,
    }
  }
}

/** Reordena comentários e renumera marcadores (RF-043, CA-07). */
export class ReorderCommentsCommand implements Command {
  readonly label = 'Reordenar comentários'
  private readonly orderedIds: readonly string[]
  private previous: Comment[] | undefined

  constructor(orderedIds: readonly string[]) {
    this.orderedIds = orderedIds
  }

  apply(project: Project): Project {
    this.previous = project.comments
    return withComments(
      project,
      reorderComments(project.comments, this.orderedIds),
    )
  }

  revert(project: Project): Project {
    return this.previous ? withComments(project, this.previous) : project
  }
}

/** Edita um comentário (título, descrição, categoria — RF-041, RF-042). */
export class UpdateCommentCommand implements Command {
  readonly label = 'Editar comentário'
  private readonly next: Comment
  private previous: Comment | undefined

  constructor(next: Comment) {
    this.next = next
  }

  apply(project: Project): Project {
    this.previous = project.comments.find((c) => c.id === this.next.id)
    return withComments(
      project,
      project.comments.map((c) => (c.id === this.next.id ? this.next : c)),
    )
  }

  revert(project: Project): Project {
    const previous = this.previous
    if (!previous) return project
    return withComments(
      project,
      project.comments.map((c) => (c.id === previous.id ? previous : c)),
    )
  }
}
