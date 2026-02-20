"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InMemoryMovieRepository_1 = require("./infrastructure/repositories/InMemoryMovieRepository");
const MovieProvider_1 = require("./application/ports/MovieProvider");
const MovieResolver_1 = require("./application/services/MovieResolver");
const MetricsRegistry_1 = require("./instrumentation/MetricsRegistry");
const MetricsCollector_1 = require("./observability/MetricsCollector");
const MetricsInstrumentation_1 = require("./observability/MetricsInstrumentation");
const InstrumentationProxy_1 = require("./observability/InstrumentationProxy");
const TmdbJsonProvider_1 = require("./infrastructure/providers/TmdbJsonProvider");
const ImdbJsonProvider_1 = require("./infrastructure/providers/ImdbJsonProvider");
const ResolveMovieById_1 = require("./application/usecases/ResolveMovieById");
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
const instrumentation = MetricsRegistry_1.MetricsRegistry;
// Repository en mémoire
const repo = new InMemoryMovieRepository_1.InMemoryMovieRepository();
// Providers (ici un mock pour test)
const providers = [new MovieProvider_1.MockMovieProvider()];
// Resolver avec instrumentation automatique (le constructeur renvoie déjà un proxy)
const resolver = new MovieResolver_1.MovieResolver({ repo, providers, instrumentation });
(async () => {
    try {
        const movie = await resolver.getById("1");
        console.log("Movie récupéré :", movie);
        // Affiche le snapshot des métriques
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        console.log("Counters :", snap.counters);
        console.log("Timers :", snap.timers);
    }
    catch (err) {
        console.error(err);
    }
})();
async function main() {
    const collector = new MetricsCollector_1.MetricsCollector();
    const instrumentation = new MetricsInstrumentation_1.MetricsInstrumentation(collector);
    const repo = (0, InstrumentationProxy_1.instrument)(new InMemoryMovieRepository_1.InMemoryMovieRepository(), instrumentation);
    const providers = [
        (0, InstrumentationProxy_1.instrument)(new TmdbJsonProvider_1.TmdbJsonProvider(), instrumentation),
        (0, InstrumentationProxy_1.instrument)(new ImdbJsonProvider_1.ImdbJsonProvider(), instrumentation),
    ];
    const useCase = (0, InstrumentationProxy_1.instrument)(new ResolveMovieById_1.ResolveMovieById(resolver, instrumentation), instrumentation);
    await useCase.execute("movie-123"); // cela devrait marcher !
    await useCase.execute("movie-456");
    await useCase.execute("movie-123"); // cache hit
    console.log("=== METRICS ===");
    console.table(collector.getMetrics());
}
main();
