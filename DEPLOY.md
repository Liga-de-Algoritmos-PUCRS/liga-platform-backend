# Deploy — liga-platform-backend

Como a produção (`back.ligadealgoritmos.com`) é servida, e como aplicar uma
mudança nela. Para rodar o projeto na sua máquina, veja o [README](README.md).

## O que roda em produção

Três containers, todos do [`docker-compose.prod.yaml`](docker-compose.prod.yaml)
e todos na rede `liga`:

| container   | imagem                        | papel                                                     |
| ----------- | ----------------------------- | --------------------------------------------------------- |
| `liga-nginx` | `nginx:latest`               | proxy reverso, TLS, único a publicar :80 e :443            |
| `liga-api`   | build local deste repositório | a API Nest, sem porta publicada — só alcançável pelo nginx |
| `liga-db`    | `postgres:15-alpine`         | banco `liga_db`, publicado apenas em `127.0.0.1:5432`      |

Pontos que costumam surpreender:

- **A imagem da API é buildada no próprio servidor** (`build: .` no compose), não
  puxada de um registry. Não existe pipeline de deploy neste repositório —
  `.github/` tem só `CODEOWNERS` e o template de PR. Deploy é o comando manual
  abaixo, rodado por SSH.
- **Produção lê o `.env.prod`**, não o `.env`. O `.env` é o arquivo de
  desenvolvimento. Nenhum dos dois é versionado; o modelo das chaves está em
  [`.env.example`](.env.example).
- **O `liga-nginx` é o único proxy.** O servidor também tem um nginx instalado
  no host, que precisa ficar mascarado (veja "nginx do host" abaixo) — se ele
  subir, agarra :80/:443 e serve 404.
- **O banco não é acessível de fora.** Para conectar um cliente gráfico, use
  túnel: `ssh -L 5432:127.0.0.1:5432 <servidor>`.

## Pré-requisitos no servidor

1. Certificados Let's Encrypt em `/etc/letsencrypt` — o compose monta esse
   diretório no nginx como somente-leitura. São necessários
   `live/back.ligadealgoritmos.com/{fullchain,privkey}.pem`,
   `options-ssl-nginx.conf` e `ssl-dhparams.pem`.
2. Um `.env.prod` no diretório do projeto, com **todas** as chaves do
   `.env.example` preenchidas. Em especial:
   - `NODE_ENV=production` — sem isso, `/docs` e `/api-json` ficam públicos;
   - `ACCESS_TOKEN_SECRET` e `REFRESH_TOKEN_SECRET` **diferentes entre si**;
   - `DATABASE_URL` apontando para o host `postgres` (nome do serviço) e o
     banco `liga_db`;
   - `DB_USER` / `DB_PASSWORD`, que a aplicação não lê mas o compose interpola.
3. O nginx do host desabilitado e mascarado.

## Comando de deploy

```bash
cd ~/liga-platform-backend
git pull --ff-only origin main
docker compose --env-file .env.prod -f docker-compose.prod.yaml up -d --build
```

**O `--env-file .env.prod` não é opcional.** O `env_file:` de um serviço só
alimenta o ambiente *dentro* do container; ele **não** alimenta a interpolação
`${...}` do compose. Sem a flag, `${DB_USER}` e `${DB_PASSWORD}` resolvem para
string vazia e o postgres é recriado sem usuário. As duas coisas são
necessárias e não se substituem.

Para forçar a recriação de todos os containers (o proxy fica fora do ar por
alguns segundos, faça em janela de baixo uso):

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yaml up -d --force-recreate
```

## Verificação depois do deploy

```bash
docker inspect -f '{{.State.Health.Status}}' liga-db                              # healthy
docker inspect -f '{{.Name}} -> {{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' \
  liga-api liga-db liga-nginx                                                     # os 3 na rede liga
docker logs liga-api --tail 30                                                    # migrate deploy sem erro de conexão
curl -s -o /dev/null -w 'user=%{http_code}\n'    https://back.ligadealgoritmos.com/user      # 401
curl -s -o /dev/null -w 'apijson=%{http_code}\n' https://back.ligadealgoritmos.com/api-json  # 404
```

Não existe rota de health-check nesta API; o sinal é o código HTTP. **401** em
`/user` prova a cadeia inteira (nginx alcançou a api e o Nest respondeu) —
**502** seria o nginx de pé sem enxergar a api. **404** em `/api-json` confirma
que o `NODE_ENV=production` está valendo.

Nenhum `docker network connect` manual deve ser necessário: os três serviços
declaram `networks: - liga` no compose.

## Rollback

O deploy não toca em dado: o volume `postgres-liga-data` é o mesmo antes e
depois. Para voltar uma versão, basta voltar o código e rebuildar:

```bash
git checkout <commit-anterior>
docker compose --env-file .env.prod -f docker-compose.prod.yaml up -d --build
```

Antes de qualquer mudança de configuração, guarde uma cópia **fora** do
diretório do git (um `git checkout` acidental restaura o arquivo versionado):

```bash
mkdir -p ~/backup-liga-$(date +%F)
cp docker-compose.prod.yaml nginx/default.conf .env.prod ~/backup-liga-$(date +%F)/
```

## nginx do host

O proxy é o container. O nginx do host precisa ficar impedido de subir:

```bash
sudo systemctl disable --now nginx
sudo systemctl mask nginx
systemctl is-enabled nginx        # esperado: masked
sudo ss -lntp | grep -E ':80 |:443 '   # dono das portas: docker-proxy
```

`disable` sozinho não basta — não impede um `start` manual nem um start por
dependência de outra unit. O `mask` impede.

## Migrações do Prisma

O container da API roda `npx prisma migrate deploy` no boot, antes de subir o
Nest, e só é iniciado depois que o healthcheck do postgres passa. Ou seja: uma
migração nova vai a produção junto com o deploy, sem comando extra. Migração
destrutiva merece janela e backup do banco (`pg_dump`) antes.

## Pegadinhas conhecidas

- **`nginx/default.conf` é o arquivo que o container serve**, montado
  `:ro`. Um erro de sintaxe aqui derruba o proxy inteiro em crash-loop, e como
  a `api` não publica porta, a API fica inalcançável de fora. Sempre valide
  antes de deployar:

  ```bash
  docker run --rm -v "$PWD/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro" \
    nginx:latest nginx -t
  ```

  Fora do servidor a validação para no primeiro arquivo do Let's Encrypt que
  não existe localmente — isso é esperado e já significa que a **sintaxe**
  passou. O que não pode aparecer é `invalid number of arguments` ou
  `unexpected end of file`.

- **O upstream do nginx é resolvido por requisição, de propósito.** O
  `resolver 127.0.0.11` mais `set $upstream api:3000` existem porque, com o
  nome escrito direto no `proxy_pass`, o nginx resolve `api` **no boot** e sai
  com `host not found in upstream` se o container da api não existir naquele
  instante — o que acontece em todo rebuild. Com `restart: unless-stopped`
  isso vira crash-loop e o site cai. Não troque de volta por
  `proxy_pass http://api:3000`.

- **Trocar a senha do postgres não é só mudar o `.env.prod`.**
  `POSTGRES_USER`/`POSTGRES_PASSWORD` só têm efeito na primeira inicialização
  do volume. Depois disso é `ALTER USER` dentro do container, e a
  `DATABASE_URL` precisa ser atualizada à parte (a senha está embutida nela).

- **A renovação do certificado está quebrada** (issue #37): o certbot está com
  `authenticator = standalone`, que precisa da :80 — ocupada pelo
  `docker-proxy` do nginx —, e `renewal-hooks/deploy/` está vazio, então nada
  recarrega o `liga-nginx` depois de renovar.
