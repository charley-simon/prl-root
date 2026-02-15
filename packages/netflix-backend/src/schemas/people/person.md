🧩 5️⃣ PersonShort (pour listes & grids)

Minimal mais suffisant pour affichage.

export const PersonShortSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String(),
  gender: Type.Optional(Type.Integer()),
  popularity: Type.Optional(Type.Number())
})


🎯 Rôle :

cartes

grilles

autocomplete

listes Actors / Directors

Pas de biographie.
Pas de dates.
Pas d’externalIds.

🧩 6️⃣ PersonDetail (profil complet backend → frontend)
export const PersonDetailSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String(),

  gender: Type.Optional(Type.Integer()),

  biography: Type.Optional(Type.String()),

  birthDay: Type.Optional(Type.String({ format: 'date' })),
  deathDay: Type.Optional(
    Type.Union([
      Type.String({ format: 'date' }),
      Type.Null()
    ])
  ),

  birthPlace: Type.Optional(Type.String()),

  homepage: Type.Optional(
    Type.Union([
      Type.String({ format: 'uri' }),
      Type.Null()
    ])
  ),

  popularity: Type.Optional(Type.Number()),

  externalIds: Type.Optional(
    Type.Record(Type.String(), Type.String())
  ),

  wikiDescription: Type.Optional(Type.String())
})

🧩 7️⃣ PersonList (structure paginée propre)
export const PersonListSchema = Type.Object({
  items: Type.Array(PersonShortSchema),
  total: Type.Integer(),
  page: Type.Optional(Type.Integer()),
  pageSize: Type.Optional(Type.Integer())
})

🏗 8️⃣ Organisation fichiers recommandée
schemas/
  people/
    person-short.schema.ts
    person-detail.schema.ts
    person-list.schema.ts
    index.ts


Dans people/index.ts :

export * from './person-short.schema'
export * from './person-detail.schema'
export * from './person-list.schema'


Puis dans schemas/index.ts :

export * from './people'


🔥 Ça c’est propre, scalable, maintenable.

🧠 9️⃣ Champ optional ou requis ?

Règle importante dans ton cas (lazy + enrichment worker) :

Un champ est :

requis → seulement si garanti à 100% par ton système

optional → si dépend d’un provider externe

Donc :

Champ	Statut
id	requis
name	requis
biography	optional
birthDay	optional
homepage	optional
externalIds	optional
wikiDescription	optional

C’est cohérent avec ton worker d’enrichissement.

🎯 10️⃣ Résumé clair

✅ Type = PersonShort / PersonDetail / PersonList
✅ Route = /people
✅ Liste structurée avec { items, total }
✅ externalIds en objet map
✅ Champs externes = optional