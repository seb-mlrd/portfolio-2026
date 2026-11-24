import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { computeTotals, lineTotal } from './totals.ts'
import { formatHundredths, parseHundredths } from './money.ts'
import { formatQuoteNumber, nextSequence } from './numbering.ts'
import { createPrintToken, newPublicToken, signHmac, verifyBearer, verifyHmac, verifyPrintToken } from './crypto.ts'
import { displayStatus, isEditable, openQuoteWhere, QuoteLockedError, updateDraft } from './status.ts'
import { todayParis } from './dates.ts'
import { fieldErrors, quoteSchema } from './schema.ts'

describe('montants', () => {
  test('saisie décimale sans flottant', () => {
    assert.equal(parseHundredths('0,5'), 50)
    assert.equal(parseHundredths('1 234.56'), 123456)
    assert.equal(parseHundredths('19,99'), 1999)
    for (const bad of ['', 'abc', '-1', '1,234', '1e3']) assert.equal(parseHundredths(bad), null)
    assert.equal(formatHundredths(123450), '1234,5')
    assert.equal(formatHundredths(100), '1')
    assert.equal(formatHundredths(5), '0,05')
  })
  test('total de ligne arrondi au centime', () => {
    assert.equal(lineTotal(50, 35001), 17501)
    assert.equal(lineTotal(33, 100), 33)
    assert.equal(lineTotal(300, 10), 30)
  })
  const lines = [{ quantityHundredths: 250, unitPriceCents: 35000 }, { quantityHundredths: 100, unitPriceCents: 1999 }]
  test('franchise de TVA', () => {
    const t = computeTotals({ lines, depositPercent: 30, vatEnabled: false, vatRateBps: 2000 })
    assert.deepEqual(t, { lineTotals: [87500, 1999], subtotalCents: 89499, vatCents: 0, totalCents: 89499, depositCents: 26850 })
  })
  test('TVA activée', () => {
    const t = computeTotals({ lines, depositPercent: 0, vatEnabled: true, vatRateBps: 2000 })
    assert.equal(t.vatCents, 17900)
    assert.equal(t.totalCents, 107399)
  })
})

describe('HMAC et tokens', () => {
  test('signature', () => {
    const sig = signHmac('{"a":1}', 's')
    assert.ok(verifyHmac('{"a":1}', sig, 's'))
    assert.ok(!verifyHmac('{"a":2}', sig, 's'))
    assert.ok(!verifyHmac('{"a":1}', sig, 'autre'))
    assert.ok(!verifyHmac('{"a":1}', '', 's'))
    assert.throws(() => signHmac('x', ''))
  })
  test('bearer', () => {
    assert.ok(verifyBearer('Bearer k', 'k'))
    for (const h of [null, 'k', 'Bearer x', 'Bearer ']) assert.ok(!verifyBearer(h, 'k'))
    assert.ok(!verifyBearer('Bearer ', ''))
    assert.ok(!verifyBearer('Bearer undefined', undefined))
  })
  test("token d'impression : lié au devis et expirant", () => {
    const token = createPrintToken('q1', 's', 1000)
    assert.ok(verifyPrintToken(token, 'q1', 's', 1000))
    assert.ok(!verifyPrintToken(token, 'q2', 's', 1000))
    assert.ok(!verifyPrintToken(token, 'q1', 's', 1000 + 11 * 60_000))
    assert.ok(!verifyPrintToken(token.replace(/^\d+/, '99999999999999'), 'q1', 's', 1000))
    assert.ok(!verifyPrintToken('', 'q1', 's'))
  })
  test('token public', () => assert.match(newPublicToken(), /^[\w-]{43}$/))
})

describe('statuts', () => {
  const today = new Date('2026-06-10T00:00:00Z')
  const base = { status: 'SENT' as const, validUntil: today, sendRequestedAt: null }
  test('affichage', () => {
    assert.equal(displayStatus(base, today), 'envoyé') // dernier jour inclus
    assert.equal(displayStatus({ ...base, validUntil: new Date('2026-06-09') }, today), 'expiré')
    assert.equal(displayStatus({ ...base, child: { sentAt: today } }, today), 'remplacé')
    assert.equal(displayStatus({ ...base, child: { sentAt: null } }, today), 'envoyé')
    assert.equal(displayStatus({ ...base, status: 'ACCEPTED', validUntil: new Date('2020-01-01') }, today), 'accepté')
    assert.equal(displayStatus({ ...base, status: 'DRAFT', sendRequestedAt: today }, today), 'envoi')
  })
  test('verrou', () => {
    assert.ok(isEditable({ status: 'DRAFT', sendRequestedAt: null }))
    assert.ok(!isEditable({ status: 'DRAFT', sendRequestedAt: today }))
    for (const status of ['SENT', 'ACCEPTED', 'REFUSED'] as const) assert.ok(!isEditable({ status, sendRequestedAt: null }))
  })
  test('jour de Paris', () => {
    assert.equal(todayParis(new Date('2026-12-31T23:30:00Z')).getUTCFullYear(), 2027)
  })
})

describe('validation', () => {
  const valid = {
    clientId: 'c', issueDate: '2026-01-01', validUntil: '2026-01-31', paymentTerms: 'x', depositPercent: '30', notes: '',
    lines: [{ serviceId: null, label: 'Site', description: '', quantity: '0,5', unit: 'jour', unitPrice: '350' }],
  }
  test('valide', () => assert.equal(quoteSchema.parse(valid).lines[0].quantity, 50))
  test('erreurs par champ', () => {
    const r = quoteSchema.safeParse({ ...valid, lines: [{ ...valid.lines[0], label: ' ', quantity: '0' }] })
    assert.deepEqual(Object.keys(fieldErrors(r.error!)).sort(), ['lines.0.label', 'lines.0.quantity'])
    assert.ok(!quoteSchema.safeParse({ ...valid, validUntil: '2025-01-01' }).success)
    assert.ok(!quoteSchema.safeParse({ ...valid, depositPercent: '101' }).success)
    assert.ok(!quoteSchema.safeParse({ ...valid, lines: [] }).success)
  })
})

describe('numérotation', () => {
  test('format', () => {
    assert.equal(formatQuoteNumber(2026, 1), 'D-2026-001')
    assert.equal(formatQuoteNumber(2026, 1000, 2), 'D-2026-1000-v2')
  })
})

// Base dédiée obligatoire : on refuse tout autre nom que *_test
const url = process.env.TEST_DATABASE_URL
const usable = !!url && new URL(url).pathname.endsWith('_test')

describe('base de données', { skip: usable ? false : 'TEST_DATABASE_URL absente' }, () => {
  let db: PrismaClient
  let clientId: string
  const YEAR = 1900 + Math.floor(Math.random() * 90)

  const create = (data: object = {}) =>
    db.$transaction(async (tx) => {
      const sequence = await nextSequence(tx, YEAR)
      return tx.quote.create({
        data: {
          number: formatQuoteNumber(YEAR, sequence), year: YEAR, sequence, publicToken: newPublicToken(), clientId,
          issueDate: todayParis(), validUntil: todayParis(), paymentTerms: 'x', vatMention: 'x',
          subtotalCents: 0, vatCents: 0, totalCents: 0, depositCents: 0, ...data,
        },
      })
    }, { maxWait: 10_000 })

  before(async () => {
    db = new PrismaClient({ datasources: { db: { url } } })
    clientId = (await db.client.create({ data: { name: 'Test', email: 't@example.com', address: 'x' } })).id
  })
  after(async () => {
    await db.quote.deleteMany({ where: { clientId } })
    await db.quoteCounter.deleteMany({ where: { year: YEAR } })
    await db.client.delete({ where: { id: clientId } })
    await db.$disconnect()
  })

  test('créations concurrentes : ni doublon ni trou, même après un échec', async () => {
    await Promise.all(Array.from({ length: 15 }, () => create()))
    await assert.rejects(create({ clientId: 'inexistant' }))
    const next = await create()
    assert.equal(next.sequence, 16)
    const all = await db.quote.findMany({ where: { year: YEAR }, orderBy: { sequence: 'asc' } })
    assert.deepEqual(all.map((q) => q.sequence), Array.from({ length: 16 }, (_, i) => i + 1))
  })

  test('un devis envoyé ou en cours d’envoi refuse toute modification', async () => {
    const draft = await create()
    await updateDraft(db, draft.id, { notes: 'ok' })
    for (const data of [{ sendRequestedAt: new Date() }, { status: 'SENT' }, { status: 'ACCEPTED' }, { status: 'REFUSED' }]) {
      const locked = await create(data)
      await assert.rejects(updateDraft(db, locked.id, { notes: 'non' }), QuoteLockedError)
      assert.equal((await db.quote.findUniqueOrThrow({ where: { id: locked.id } })).notes, null)
    }
  })

  test('une version remplacée ou expirée ne peut plus être acceptée', async () => {
    const isOpen = async (id: string) => (await db.quote.count({ where: { id, ...openQuoteWhere() } })) === 1
    const v1 = await create({ status: 'SENT' })
    assert.ok(await isOpen(v1.id))
    const v2 = await create({ parentId: v1.id })
    assert.ok(await isOpen(v1.id)) // v2 encore en brouillon
    await db.quote.update({ where: { id: v2.id }, data: { sentAt: new Date() } })
    assert.ok(!(await isOpen(v1.id)))
    const old = await create({ status: 'SENT', validUntil: new Date('2020-01-01') })
    assert.ok(!(await isOpen(old.id)))
  })
})
