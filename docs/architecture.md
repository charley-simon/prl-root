# Architecture

Ce document décrit la vision globale, les principes et l'architecture du projet.

Super ! Voilà un guide de lecture pour ton diagramme, qui fait le lien entre chaque couleur / branche et ton projet Netflix-like.

🎨 Légende des couleurs

Couleur Type / rôle Exemple sur le diagramme Comment l’interpréter
Bleu Domaine (entités + objets métier) Movie.ts Logique métier pure, indépendante de l’infra
Vert Application / ports (interfaces) PlayMoviePort.ts, MovieRepositoryPort.ts Contrats définis par le domaine ou usecases, inbound/outbound
Cyan Usecases PlayMovieUseCase.ts Orchestration métier, scénario complet sur plusieurs entités / ports
Orange Infrastructure / adapters TypeOrmMovieRepository.ts, ImdbApiProvider.ts Implémentations concrètes des ports (DB, API externe…)
Violet Cache / instrumentation / observability InMemoryCache.ts, MetricsCollector.ts, TraceRecorder.ts Services techniques transverses, infra mais utiles au domaine
Vert clair Tests unitaires PlayMovieUseCase.test.ts Tests proches du code qu’ils vérifient, reflètent l’implémentation
Rose Tests scénarios / use cases premium-user-can-play.test.ts Tests orientés métier, usage, traversent plusieurs modules
Jaune Tests d’intégration / replay TypeOrmMovieRepository.integration.test.ts, PlayMovie.replay.test.ts Tests techniques et replay, valident l’infrastructure ou le comportement observé
🧩 Interprétation des branches

src/

Contient tout le code source

Organisé par couches hexagonales : domain / application / infrastructure

Les sous-dossiers représentent features (movie) ou rôles (ports / usecases / adapters)

src/application/.../tests/

Tests unitaires, collés aux usecases ou ports

Changent fréquemment, suivent l’implémentation

tests/scenarios/

Tests métiers / scénarios

N’ont pas besoin de savoir qu’il existe un MovieResolver ou un TypeOrmMovieRepository

Lisibles par les PO / QA, représentent des usages du système

Changent peu, reflètent les règles métier

tests/integration/

Valide que les adapters / infra fonctionnent ensemble

Par exemple, TypeOrmMovieRepository.integration.test.ts teste DB + repository

tests/replay/

Valide le système observé / replay avec des données réelles

Très stable, permet d’analyser comportements réels

🔑 Points à retenir

Unitaires → suivent le code → couleur vert clair → fréquemment modifiés

Scénarios / use cases → suivent le métier → couleur rose → rarement modifiés

Ports / usecases / adapters sont séparés clairement

Chaque module peut avoir ses tests unitaires à côté, tandis que les tests métier sont centralisés et lisibles indépendamment
