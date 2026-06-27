ALTER TABLE "Usuario" ADD COLUMN "username" TEXT;

WITH base_usernames AS (
  SELECT
    "id",
    NULLIF(
      LOWER(
        REGEXP_REPLACE(
          COALESCE(SPLIT_PART("email", '@', 1), "nome", SUBSTRING("id"::TEXT, 1, 8)),
          '[^a-zA-Z0-9._-]+',
          '',
          'g'
        )
      ),
      ''
    ) AS "baseUsername"
  FROM "Usuario"
),
normalized_usernames AS (
  SELECT
    "id",
    COALESCE("baseUsername", CONCAT('usuario', SUBSTRING("id"::TEXT, 1, 8))) AS "baseUsername"
  FROM base_usernames
),
ranked_usernames AS (
  SELECT
    "id",
    "baseUsername",
    ROW_NUMBER() OVER (PARTITION BY "baseUsername" ORDER BY "id") AS "duplicateIndex"
  FROM normalized_usernames
)
UPDATE "Usuario"
SET "username" = CASE
  WHEN ranked_usernames."duplicateIndex" = 1 THEN ranked_usernames."baseUsername"
  ELSE CONCAT(ranked_usernames."baseUsername", ranked_usernames."duplicateIndex")
END
FROM ranked_usernames
WHERE "Usuario"."id" = ranked_usernames."id";

ALTER TABLE "Usuario" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "Usuario" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");
