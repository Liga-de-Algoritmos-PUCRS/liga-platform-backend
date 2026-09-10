#!/usr/bin/env bash
# Deploy hook do certbot (issue #37). Copiar a mao para
# /etc/letsencrypt/renewal-hooks/deploy/ no servidor e dar chmod +x --
# nao pode ser montado por volume, porque /etc/letsencrypt e :ro no compose
# e o certbot do host escreve fora do container.
#
# O certbot roda todo script executavel dessa pasta depois de QUALQUER
# renovacao bem-sucedida nesse host (RENEWED_DOMAINS lista os dominios
# renovados) -- hoje ha um certificado so, entao isso e seguro sem filtro.
#
# --dry-run NAO dispara deploy-hooks (nao ha renovacao de verdade para
# disparar); para provar que o hook funciona, rode-o a mao uma vez e
# confira o log e o reload do nginx.
set -euo pipefail

LOG_FILE="/var/log/certbot-deploy-hook.log"

echo "$(date -Is) renovado: ${RENEWED_DOMAINS:-desconhecido} -- recarregando liga-nginx" >> "$LOG_FILE"
docker exec liga-nginx nginx -s reload >> "$LOG_FILE" 2>&1
echo "$(date -Is) reload concluido" >> "$LOG_FILE"
