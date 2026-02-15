import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { FormatRegistry } from '@sinclair/typebox'

export function IsDate(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}
FormatRegistry.Set('date', IsDate);

// ---- AJV + ajv-formats pour formats stricts ----
addFormats(new Ajv({ allErrors: true, strict: false }))
