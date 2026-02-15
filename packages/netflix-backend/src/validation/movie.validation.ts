import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { TSchema } from '@sinclair/typebox'

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

export function createValidator(schema: TSchema) {
  const fast = TypeCompiler.Compile(schema)
  const strict = ajv.compile(schema)

  return {
    fast: (data: unknown) => fast.Check(data),
    strict: (data: unknown) => strict(data)
  }
}

/* Utilisation:
const movieDetailValidator = createValidator(MovieDetailSchema)

movieDetailValidator.fast(data)    // rapide
movieDetailValidator.strict(data)  // strict + formats
*/