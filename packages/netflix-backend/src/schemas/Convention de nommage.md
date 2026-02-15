🎯 1️⃣ Norme de nommage : claire et scalable

Tu hésites entre :

people-liste

peopleListe

people-short

peopleDetail

etc.

🔥 Règle simple et professionnelle (API + TypeScript)
👉 Pour les types / schémas → PascalCase
👉 Pour les routes HTTP → kebab-case
👉 Pour les fichiers → kebab-case
👉 Pour les objets JSON → camelCase
🧱 2️⃣ Convention recommandée
🔹 Schémas / Types
PersonShort
PersonDetail
PersonList


Pourquoi singulier ?

Parce que :

Un élément = Person

Une liste = PersonList

Ce n’est pas “PeopleShort”, mais “PersonShort”

👉 Le type représente UNE entité.

🔹 Structure standard d’une liste (norme REST propre)

On évite :

[
  { ... },
  { ... }
]


On préfère :

{
  "items": [ ... ],
  "total": 124,
  "page": 1,
  "pageSize": 20
}


Donc :

PersonList = {
  items: PersonShort[],
  total: number,
  page?: number,
  pageSize?: number
}

🧠 3️⃣ Pourquoi Person et pas People ?

Parce que :

People = mot métier (route)

Person = entité typée

Exemple :

GET /people
GET /people/108


Mais en TypeScript :

PersonShort
PersonDetail
PersonList


C’est beaucoup plus propre.