/**
 * Geração de identificadores. Usa a API nativa `crypto.randomUUID`
 * (disponível nos navegadores suportados — seção 14.4, preferir APIs
 * nativas). Fatorias aceitam um id explícito para testes determinísticos.
 */
export function newId(): string {
  return crypto.randomUUID()
}
