-- Novo modelo de pontuacao competitiva (back#15).
--
-- ATENCAO: esta migracao e DESTRUTIVA de proposito. Ela apaga todas as
-- submissoes e zera a pontuacao de todos os usuarios -- decisao do dono ao
-- trocar de modelo ("reset geral"), sem preservar nem recalcular historico.
-- A ordem dos passos importa: o DELETE tem que vir antes do indice unico,
-- porque o modelo antigo permitia varias submissoes do mesmo aluno para o
-- mesmo problema e o CREATE UNIQUE INDEX falharia com essas duplicatas.

-- 1. Parametros da corrida. O DEFAULT ja faz o backfill (100 / 70 / 5)
--    dos problemas que existem hoje.
ALTER TABLE "problems" ADD COLUMN     "initial_points" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "floor_points" INTEGER NOT NULL DEFAULT 70,
ADD COLUMN     "decrement" INTEGER NOT NULL DEFAULT 5;

-- 2. Reset geral: a corrida recomeca do zero no modelo novo.
DELETE FROM "submissions";

UPDATE "users"
SET "all_points" = 0,
    "monthly_points" = 0,
    "problems_resolved" = 0,
    "submissions_number" = 0;

UPDATE "problems"
SET "points" = "initial_points",
    "resolved" = 0,
    "submits" = 0;

-- 3. Uma submissao por (aluno, problema). So aplica depois do DELETE acima.
CREATE UNIQUE INDEX "submissions_user_id_problem_id_key" ON "submissions"("user_id", "problem_id");
