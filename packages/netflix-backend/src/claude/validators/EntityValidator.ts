// src/validators/EntityValidator.ts
import { TypeCompiler, TypeCheck } from '@sinclair/typebox/compiler'
import { TSchema, Static } from '@sinclair/typebox'
import { MovieDetailSchema } from '../../schemas/movies/movie-detail.schema'
import { PersonDetailSchema } from '../../schemas/people/person-detail.schema'
import { CompanySchema } from '../../schemas/company.schema'
import { EntityKind, Entity } from '../../schemas/entity.schema'

// Erreur dédiée, même pattern que ProviderError
export class ValidationError extends Error {
  constructor(
    public readonly kind: EntityKind,
    public readonly errors: unknown[]
  ) {
    super(`[ValidationError] Invalid ${kind}: ${JSON.stringify(errors)}`)
    this.name = 'ValidationError'
  }
}

// Le contrat
export interface EntityValidator {
  validate(entity: Entity): void // plus simple, asserts complique le générique
}

export class TypeboxEntityValidator implements EntityValidator {
  private readonly validators = new Map<EntityKind, TypeCheck<TSchema>>([
    ['Movie', TypeCompiler.Compile(MovieDetailSchema)],
    ['Person', TypeCompiler.Compile(PersonDetailSchema)],
    ['Company', TypeCompiler.Compile(CompanySchema)]
  ])

  validate<T extends Entity>(entity: T): asserts entity is T {
    const validator = this.validators.get(entity.kind as EntityKind)

    if (!validator) {
      throw new ValidationError(entity.kind as EntityKind, [`Unknown kind: ${entity.kind}`])
    }

    if (!validator.Check(entity)) {
      const errors = [...validator.Errors(entity)]
      throw new ValidationError((entity as Entity).kind, errors) // ← fix ici
    }
  }
}
