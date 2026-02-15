# Architecture Decisions Record

Ce document consigne les decisions techniques importantes et leurs motivations.

netflix-backend/
src/
application/
ports/
services/
usecases/
cache/
domain/
movie/
infrastructure/
providers/
repositories/
instrumentation/
observability/
tests/
application/
domain/
infrastructure/
providers/
replay/
scenarios/
unit/
domain/
instrumentation/
integration/
repositories/

Questions:

- entre src/ et tests/, il y a comme un mirroir mais pas vraiment -> incohérence ?
- dans src/application/, ports/, services/ et usecases/ sont au même niveau: incohérence ?
- tests/unit/: repositories/ n'est pas dans un sous-repértoire d'infrastructure/: incohérence ?

On voit une similarité entre l'arborescence de src/ et tests/ ainsi que tests/unit/. C'est comme si cela voulait nous dire quelque chose:
src/
a/
b/
c/
tests/
a/
b/
c/
unit/
a/
b/
c/
ne dervrait il pas devenir
src/
a/
tests/
unit/
b/
tests/
unit/
c/
tests/
unit/

|     |     |     |
| --- | --- | --- |
|     |     |     |
|     |     |     |
