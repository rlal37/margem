/**
 * Modelo de comandos reversíveis (seção 14.3).
 *
 * Toda edição de anotação ou comentário é um `Command` puro sobre o
 * `Project`: `apply` produz o próximo estado e `revert` restaura o anterior.
 * Isso garante que desfazer/refazer alcancem qualquer mudança (RF-050) e
 * mantém o histórico testável sem acoplar à UI (a integração com atalhos e
 * botões é o WP-06).
 *
 * Contrato importante: `apply` deve recapturar, a cada chamada, os dados
 * necessários para o `revert` correspondente. Assim o refazer (que
 * reexecuta `apply`) permanece correto após um desfazer.
 */

import { HISTORY_LIMIT } from '../../domain/constants'
import type { Project } from '../../domain/types'

export interface Command {
  /** Rótulo curto para histórico e acessibilidade. */
  readonly label: string
  apply(project: Project): Project
  revert(project: Project): Project
}

/**
 * Pilha de histórico. Mantém o estado atual e as pilhas de desfazer/refazer.
 * Ao ultrapassar o limite (RF-051, padrão 50), descarta a ação mais antiga.
 */
export class ProjectHistory {
  private current: Project
  private readonly undoStack: Command[] = []
  private readonly redoStack: Command[] = []
  private readonly limit: number

  constructor(initial: Project, limit: number = HISTORY_LIMIT) {
    this.current = initial
    this.limit = limit
  }

  get state(): Project {
    return this.current
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /** Executa um comando, limpando a pilha de refazer. */
  execute(command: Command): Project {
    this.current = command.apply(this.current)
    this.undoStack.push(command)
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift()
    }
    this.redoStack.length = 0
    return this.current
  }

  undo(): Project {
    const command = this.undoStack.pop()
    if (command) {
      this.current = command.revert(this.current)
      this.redoStack.push(command)
    }
    return this.current
  }

  redo(): Project {
    const command = this.redoStack.pop()
    if (command) {
      this.current = command.apply(this.current)
      this.undoStack.push(command)
    }
    return this.current
  }
}
