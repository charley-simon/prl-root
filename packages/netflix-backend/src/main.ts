import { InMemoryMovieRepository } from "./infrastructure/repositories/InMemoryMovieRepository";
import { MockMovieProvider } from "./application/ports/MovieProvider";
import { MovieResolver } from "./application/services/MovieResolver";
import { MetricsRegistry } from "./instrumentation/MetricsRegistry";
import { MetricsCollector } from "./observability/MetricsCollector";
import { MetricsInstrumentation } from "./observability/MetricsInstrumentation";
import { instrument } from "./observability/InstrumentationProxy";
import { TmdbJsonProvider } from "./infrastructure/providers/TmdbJsonProvider";
import { ImdbJsonProvider } from "./infrastructure/providers/ImdbJsonProvider";
import { ResolveMovieById } from "./application/usecases/ResolveMovieById";
/**
ResolveMovieById:
cherche en local (Mongo mock / in-memory)
sinon appelle un provider TMDB mock (JSON)
mappe vers le domaine
sauvegarde
retourne un Movie

Vue globale du flux:
Caller
  ↓
ResolveMovieUseCase
  ↓
MovieResolver
  ├── LocalMovieRepository (mock)
  ├── TmdbMovieProviderMock (JSON)
  └── ImdbJsonProviderMock (JSON)
        ↓
     MovieMapper
        ↓
     Movie (Domain)
        ↓
     save()
*/

// Initialisation de l'instrumentation
const instrumentation = MetricsRegistry;

// Repository en mémoire
const repo = new InMemoryMovieRepository();

// Providers (ici un mock pour test)
const providers = [new MockMovieProvider()];

// Resolver avec instrumentation automatique (le constructeur renvoie déjà un proxy)
const resolver = new MovieResolver({ repo, providers, instrumentation });

(async () => {
  try {
    const movie = await resolver.getById("1");
    console.log("Movie récupéré :", movie);

    // Affiche le snapshot des métriques
    const snap = MetricsRegistry.snapshot();
    console.log("Counters :", snap.counters);
    console.log("Timers :", snap.timers);
  } catch (err) {
    console.error(err);
  }
})();

async function main() {
  const collector = new MetricsCollector();
  const instrumentation = new MetricsInstrumentation(collector);

  const repo = instrument(new InMemoryMovieRepository(), instrumentation);
  const providers = [
    instrument(new TmdbJsonProvider(), instrumentation),
    instrument(new ImdbJsonProvider(), instrumentation),
  ];

  const useCase = instrument(
    new ResolveMovieById(resolver, instrumentation),
    instrumentation,
  );

  await useCase.execute("movie-123"); // cela devrait marcher !
  await useCase.execute("movie-456");
  await useCase.execute("movie-123"); // cache hit

  console.log("=== METRICS ===");
  console.table(collector.getMetrics());
}

main();
