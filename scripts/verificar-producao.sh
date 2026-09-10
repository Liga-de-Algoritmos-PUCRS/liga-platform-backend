#!/usr/bin/env bash
# Compara a imagem que o container liga-api esta rodando com o IMAGE_TAG
# gravado em .env.prod (a fonte de verdade do ultimo deploy, atualizada pelo
# deploy.yml a cada push na main). Roda dentro do diretorio do projeto na
# EC2, por SSH -- chamado tanto pelo passo de verificacao do deploy.yml
# quanto pelo workflow agendado verificar-producao.yml (issue #37: sem isso
# o unico sinal de "produção atualizada" era o Actions verde, que não pegava
# um caminho fora do repo -- o cron das 03:00 -- rebaixando a imagem local).
#
# Saida: 0 e "em dia" se a imagem em execucao bate com o IMAGE_TAG esperado;
# 1 e "divergente" se nao bate; 2 em erro de uso/ambiente.
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE=".env.prod"
IMAGE="ghcr.io/liga-de-algoritmos-pucrs/liga-platform-backend"

if [ -n "${1:-}" ]; then
  EXPECTED_TAG="$1"
else
  if [ ! -f "$ENV_FILE" ]; then
    echo "arquivo $ENV_FILE nao encontrado em $(pwd)" >&2
    exit 2
  fi
  EXPECTED_TAG=$(grep -E '^IMAGE_TAG=' "$ENV_FILE" | tail -n1 | cut -d= -f2-)
fi

if [ -z "${EXPECTED_TAG:-}" ]; then
  echo "IMAGE_TAG nao encontrado em $ENV_FILE e nenhum argumento foi passado" >&2
  exit 2
fi

RUNNING_ID=$(docker inspect --format '{{.Image}}' liga-api 2>/dev/null || true)
if [ -z "$RUNNING_ID" ]; then
  echo "container liga-api nao encontrado" >&2
  exit 2
fi

EXPECTED_ID=$(docker inspect --format '{{.Id}}' "$IMAGE:$EXPECTED_TAG" 2>/dev/null || true)
if [ -z "$EXPECTED_ID" ]; then
  echo "imagem $IMAGE:$EXPECTED_TAG nao existe localmente -- puxando para comparar" >&2
  docker pull "$IMAGE:$EXPECTED_TAG" >/dev/null
  EXPECTED_ID=$(docker inspect --format '{{.Id}}' "$IMAGE:$EXPECTED_TAG")
fi

if [ "$RUNNING_ID" = "$EXPECTED_ID" ]; then
  echo "em dia: liga-api roda $IMAGE:$EXPECTED_TAG ($RUNNING_ID)"
  exit 0
else
  echo "divergente: esperado $IMAGE:$EXPECTED_TAG ($EXPECTED_ID), liga-api roda $RUNNING_ID" >&2
  exit 1
fi
