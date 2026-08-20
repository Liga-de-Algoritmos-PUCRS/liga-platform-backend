import { setTimeout as sleep } from 'timers/promises';

/**
 * Roda `work` e so devolve o resultado depois que `minimumMs` tiver passado
 * desde o inicio da chamada. Se `work` demorar mais que isso, nada e somado.
 *
 * Serve para as rotas publicas que ramificam por "esse e-mail tem conta?":
 * igualar corpo e status nao basta quando um dos ramos faz escritas a mais no
 * banco -- o tempo de resposta continua classificando o endereco. O piso
 * fixo esconde a diferenca de trabalho de dentro dele.
 *
 * O `finally` tambem segura o caminho de excecao de proposito: se a falha
 * respondesse na hora, um erro rapido voltaria a ser um canal lateral.
 */
export async function withMinimumResponseTime<T>(
  minimumMs: number,
  work: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();

  try {
    return await work();
  } finally {
    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs < minimumMs) {
      await sleep(minimumMs - elapsedMs);
    }
  }
}
