import type { Prisma } from '@prisma/client'

export function formatQuoteNumber(year: number, sequence: number, version = 1): string {
  const base = `D-${year}-${String(sequence).padStart(3, '0')}`
  return version > 1 ? `${base}-v${version}` : base
}

/**
 * À appeler dans la transaction qui crée le devis : la ligne du compteur reste verrouillée
 * jusqu'au commit (pas de doublon) et l'incrément est annulé en cas d'échec (pas de trou).
 */
export async function nextSequence(tx: Prisma.TransactionClient, year: number): Promise<number> {
  const rows = await tx.$queryRaw<{ last: number }[]>`
    INSERT INTO "QuoteCounter" ("year", "last") VALUES (${year}, 1)
    ON CONFLICT ("year") DO UPDATE SET "last" = "QuoteCounter"."last" + 1
    RETURNING "last"`
  return rows[0].last
}
