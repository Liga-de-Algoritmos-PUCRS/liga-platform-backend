# Deploy — liga-platform-backend

Como a produção (`back.ligadealgoritmos.com`) é servida, e como aplicar uma
mudança nela. Para rodar o projeto na sua máquina, veja o [README](README.md).

## O que roda em produção

Três containers, todos do [`docker-compose.prod.yaml`](docker-compose.prod.yaml)
e todos na rede `liga`:

| container   | imagem                        | papel                                                     |
| ----------- | ----------------------------- | --------------------------------------------------------- |
| `liga-nginx` | `nginx:latest`               | proxy reverso, TLS, único a publicar :80 e :443            |
| `liga-api`   | `ghcr.io/liga-de-algoritmos-pucrs/liga-platform-backend` | a API Nest, sem porta publicada — só alcançável pelo nginx |
| `liga-db`    | `postgres:15-alpine`         | banco `liga_db`, publicado apenas em `127.0.0.1:5432`      |

Pontos que costumam surpreender:

- **A imagem da API vem do GHCR, buildada pelo GitHub Actions** — o servidor não
  compila mais nada durante o deploy, só puxa a imagem e troca o container. O
  `build:` continua no compose como saída de emergência (veja "Deploy manual").
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
   - `DB_USER` / `DB_PASSWORD`, que a aplicação não lê mas o compose interpola;
   - `PORT` vazia ou `3000` — o nginx faz proxy para `api:3000`; outro valor
     aqui exige mudar o `set $upstream` do `nginx/default.conf` junto, senão a
     API responde 502.
3. O nginx do host desabilitado e mascarado.

## Configuração inicial do CI/CD (uma vez só)

Nada disso é necessário no dia a dia — é o que precisa existir para o deploy
automático funcionar. Se algum passo faltar, o job de deploy **falha** e a
produção **continua no ar** com a versão anterior: o container antigo só é
trocado depois que a imagem nova é puxada com sucesso.

### 1. Par de chaves dedicado ao deploy

No servidor, gere um par **só para o GitHub Actions** — não reaproveite a chave
pessoal de ninguém, para poder revogar só o deploy sem afetar o resto:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gha-deploy -C "github-actions-deploy" -N ""
cat ~/.ssh/gha-deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/gha-deploy          # a PRIVADA: vai para o secret EC2_SSH_KEY
```

O `-N ""` é de propósito: chave com passphrase não serve para automação. Para
revogar depois, apague a linha correspondente do `~/.ssh/authorized_keys`.

Confirme que a senha está desabilitada no SSH (`PasswordAuthentication no` em
`/etc/ssh/sshd_config`) — é o que sustenta a decisão do Security Group abaixo.

### 2. Secrets do repositório

Em **Settings → Secrets and variables → Actions → New repository secret**:

| secret          | o que é                                                             |
| --------------- | ------------------------------------------------------------------- |
| `EC2_HOST`      | IP ou DNS do servidor                                                |
| `EC2_USERNAME`  | usuário do SSH — `ubuntu`, dono de `~/liga-platform-backend`          |
| `EC2_SSH_KEY`   | a chave **privada inteira** do passo 1, com as linhas `BEGIN`/`END`   |

**Nenhum secret de AWS é necessário.** O push no GHCR usa o `GITHUB_TOKEN` que
o próprio Actions injeta; por isso o job de build declara
`permissions: packages: write`.

### 3. Security Group: :22 aberto para os runners

Os runners hospedados do GitHub **não têm faixa de IP fixa**, então o :22 precisa
aceitar `0.0.0.0/0`. É a decisão de segurança consciente desta configuração, e o
que a torna aceitável é o par acima: chave dedicada e revogável, senha
desabilitada. Restringir por IP não é viável (a lista de faixas do GitHub muda
sozinha e quebraria o deploy); as alternativas de verdade seriam um self-hosted
runner ou AWS SSM.

### 4. Repositório limpo na EC2

O deploy usa `git pull --ff-only`, que **falha** se houver modificação local no
diretório do projeto. É de propósito — o servidor nunca perde alteração em
silêncio —, mas significa que o repositório precisa estar limpo **antes** do
primeiro deploy automático:

```bash
cd ~/liga-platform-backend
git status --short                                  # tem que sair vazio
```

Se não estiver, guarde uma cópia **fora** do diretório do git antes de limpar
(um `git checkout` restaura o arquivo versionado por cima):

```bash
mkdir -p ~/backup-liga-$(date +%F)
cp docker-compose.prod.yaml nginx/default.conf .env.prod ~/backup-liga-$(date +%F)/
git checkout -- .            # descarta as modificações locais
git pull --ff-only origin main
```

O `.env.prod` não é afetado: ele é ignorado pelo git e sobrevive a tudo isso.

### 5. Visibilidade do pacote no GHCR

**O pacote nasce privado**, e no primeiro deploy o `build-and-push` passa mas o
`deploy` falha no `pull` (produção intacta). Para resolver: página do pacote →
**Package settings → Change visibility → Public** → e então _Re-run failed jobs_
no run que falhou.

Público é a escolha deliberada aqui: **este repositório já é público**, então a
imagem não expõe nada que o código-fonte não exponha — o `.dockerignore` mantém
`.env` e `.env.*` fora da imagem, e os segredos entram em runtime pelo
`env_file: .env.prod`. Em troca, o servidor puxa **anônimo**: sem PAT, sem
`docker login`, sem credencial em texto claro no `~/.docker/config.json` e sem o
deploy quebrar no dia em que um token expirar.

Se um dia o repositório for fechado, aí o pacote deve voltar a privado — e o
servidor passa a precisar de `docker login ghcr.io` com um PAT de escopo
`read:packages`.

### 6. Tornar o check do CI obrigatório

Em **Settings → Branches → branch protection da `main` → Require status checks
to pass** → selecionar **`lint-build`**. O check só aparece nessa lista **depois
de rodar uma vez**, então abra um PR qualquer antes. Sem isso o CI é decorativo:
dá para mergear com ele vermelho.

## Deploy automático (o caminho normal)

**Merge na `main` = produção atualizada.** Não há comando a rodar: o workflow
[`deploy.yml`](.github/workflows/deploy.yml) dispara no push da `main` e faz,
em dois jobs:

1. `build-and-push` — builda a imagem **no runner do GitHub** e publica no GHCR
   com duas tags: o SHA completo do commit e `latest`.
2. `deploy` — só começa depois que o primeiro termina verde (`needs:`). Entra
   por SSH na EC2, faz `git pull --ff-only origin main`, puxa a imagem daquela
   tag e sobe os containers. Nada é compilado no servidor.

Depois disso o próprio job verifica a produção pela internet (401 em `/user`,
404 em `/api-json`, até 6 tentativas espaçadas de 10s) e **fica vermelho se não
bater** — deploy verde significa produção respondendo, não apenas "o compose
não errou".

Duas coisas que valem saber:

- **Push que só mexe em `*.md` não deploya** (`paths-ignore`): corrigir um typo
  em documentação não justifica os segundos de 502 da recriação do container.
- **`concurrency: deploy-prod` serializa os deploys**, sem cancelar o que já
  está no meio — dois merges seguidos viram dois deploys em fila.

> ⚠️ **Migração de Prisma vai a produção sozinha.** O container roda
> `npx prisma migrate deploy` no boot, então uma migração nova é aplicada no
> merge, sem ninguém aprovar nada. Migração **destrutiva** exige janela de baixo
> uso e `pg_dump` antes — veja "Migrações do Prisma".

## Deploy manual (saída de emergência)

Continua funcionando e continua sendo suportado: use quando o GHCR estiver fora
do ar, quando o Actions estiver indisponível, ou num hotfix que não pode esperar
o pipeline.

```bash
cd ~/liga-platform-backend
git pull --ff-only origin main
docker compose --env-file .env.prod -f docker-compose.prod.yaml up -d --build
```

O `--build` faz o servidor compilar a imagem localmente e sobrescrever a tag
`:latest` local. Não é preciso definir `IMAGE_TAG`: o compose tem
`${IMAGE_TAG:-latest}` como default. O próximo deploy automático volta a puxar
do registry e desfaz isso naturalmente.

**O `--env-file .env.prod` não é opcional.** O `env_file:` de um serviço só
alimenta o ambiente *dentro* do container; ele **não** alimenta a interpolação
`${...}` do compose. As duas coisas são necessárias e não se substituem.

Sem a flag, o compose **aborta antes de mexer em qualquer container**:

```
$ docker compose -f docker-compose.prod.yaml up -d
error while interpolating services.postgres.environment.POSTGRES_USER:
required variable DB_USER is missing a value: defina DB_USER e rode o deploy
com --env-file .env.prod (ver DEPLOY.md)
```

É de propósito: o `${DB_USER:?...}` do compose troca uma falha silenciosa (o
postgres sendo recriado com usuário vazio) por uma recusa em subir.

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
depois. Como cada commit da `main` tem uma imagem imutável no GHCR, voltar uma
versão é **apontar para outra tag** — não recompilar código.

**Pela UI do Actions (não precisa de chave SSH):** aba Actions → workflow
_"Deploy para a EC2 (GHCR)"_ → **Run workflow** → preencher `image_tag` com o
**SHA completo** do commit para o qual voltar (o mesmo que aparece no `git log`
e na página do pacote). Com a tag preenchida, o job de build é **pulado** — a
imagem já existe — e só o deploy roda.

**Por SSH, se o Actions estiver fora:**

```bash
cd ~/liga-platform-backend
IMAGE_TAG=<sha-completo> docker compose --env-file .env.prod \
  -f docker-compose.prod.yaml pull api
IMAGE_TAG=<sha-completo> docker compose --env-file .env.prod \
  -f docker-compose.prod.yaml up -d
```

O `IMAGE_TAG` precisa estar nos **dois** comandos: sem ele o compose cai no
default `:latest`, que é a versão mais nova — ou seja, o rollback não reverteria
nada. Confira depois com:

```bash
docker inspect -f '{{.Config.Image}}' liga-api
```

Duas limitações que valem saber:

- **Rollback troca a imagem, não a configuração.** O deploy sempre faz `git pull`
  da `main`, então `docker-compose.prod.yaml` e `nginx/default.conf` continuam
  na versão mais nova. Para reverter um desses, é
  `git checkout <sha> -- <arquivo>` à mão no servidor.
- **Rollback não desfaz migração de banco.** Se a versão nova aplicou uma
  migração destrutiva, voltar a imagem não traz os dados de volta — é aí que
  entra o `pg_dump` prévio.

Antes de mexer em configuração no servidor, guarde uma cópia **fora** do
diretório do git (um `git checkout` acidental restaura o arquivo versionado por
cima):

```bash
mkdir -p ~/backup-liga-$(date +%F)
cp docker-compose.prod.yaml nginx/default.conf .env.prod ~/backup-liga-$(date +%F)/
```

Para voltar ao topo, rode o `workflow_dispatch` de novo com o SHA mais recente
(ou dê um push novo na `main`).

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
Nest, e só é iniciado depois que o healthcheck do postgres passa.

Com o deploy automático, isso quer dizer que **uma migração vai a produção no
merge do PR**, sem comando extra e sem ninguém aprovar o passo. Para migração
aditiva (coluna nova, tabela nova) isso é o que se quer. Para migração
**destrutiva** — `DROP`, `RENAME`, mudança de tipo que perde dado —, o merge
passa a ser a operação de risco:

1. escolha uma janela de baixo uso e avise antes de mergear;
2. `pg_dump` do banco **antes**, guardado fora do servidor;
3. lembre que rollback de imagem **não desfaz migração** — voltar a tag traz o
   código antigo de volta contra um banco já migrado.

Não há backup automático no deploy: a esmagadora maioria das migrações é
aditiva, e um `pg_dump` a cada merge custaria disco e tempo sem pagar por si.

## Pegadinhas conhecidas

- **O `--env-file .env.prod` é obrigatório também no `pull`**, não só no `up`.
  O compose interpola `${DB_USER:?}` ao ler o arquivo, antes de decidir o que
  vai fazer — sem a flag, qualquer subcomando aborta.

- **O deploy roda `docker system prune -f`, sem `-a` e sem `--volumes`.** Nunca
  acrescente nenhum dos dois: `--volumes` apagaria o `postgres-liga-data`, que é
  o banco de produção, e `-a` removeria imagens ainda referenciadas, incluindo
  as tags antigas que servem de rollback. O prune padrão só limpa camadas
  órfãs; se o disco apertar com o tempo, a limpeza mais agressiva é decisão
  manual, conferindo antes o que seria removido com `docker system df`.

- **O check `lint-build` do PR não roda migração nem sobe banco.** Ele é
  `npm ci` → `npx prisma generate` → `lint` → `build`, e o `prisma generate` só
  lê o `schema.prisma` — não precisa de `DATABASE_URL` nem de Postgres. Se um
  dia o CI passar a precisar de banco, é sinal de que algo passou a resolver a
  URL do datasource em tempo de build.

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
