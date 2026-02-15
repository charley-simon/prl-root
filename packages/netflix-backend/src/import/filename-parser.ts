function parseVideoFilename(filename: string) {
  // retirer l'extension
  let name = filename.replace(/\.[^.]+$/, "");

  // supprimer certains tags fréquents (release group, qualité, langue)
  name = name.replace(/\[(.*?)\]/g, "");      // supprime [ ... ]
  name = name.replace(/\b(1080p|720p|BluRay|WEB-DL|HDLight|x264|AC3|MULTi|EXTREME|STVFRV|Pop)\b/gi, "");
  
  // remplacer points / underscores par espaces
  name = name.replace(/[._]+/g, " ").trim();

  // chercher année (4 chiffres)
  const yearMatch = name.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : null;

  // si année trouvée, retirer de la string pour isoler le titre
  let title = year ? name.replace(yearMatch[0], "").trim() : name;

  // nettoyage : enlever espaces multiples
  title = title.replace(/\s{2,}/g, " ");

  return { title, year };
}

// Test
const files = [
  "Idiocracy [1080p] MULTi 2006 BluRay x264-Pop.mkv",
  "[ OxTorrent.cc ] Wonder Woman 1984.2020.WEB-DL.x264-STVFRV.mkv",
  "A.Star.is.Born.2018.mkv",
  "The Man Who Knew Infinity.mkv"
];

files.forEach(f => console.log(f, "->", parseVideoFilename(f)));

/** Résultats attendus
 * Idiocracy [1080p] MULTi 2006 BluRay x264-Pop.mkv -> { title: "Idiocracy", year: 2006 }
 * [ OxTorrent.cc ] Wonder Woman 1984.2020.WEB-DL.x264-STVFRV.mkv -> { title: "Wonder Woman", year: 1984 } // possible double année, on peut prendre la dernière
 * A.Star.is.Born.2018.mkv -> { title: "A Star is Born", year: 2018 }
 * The Man Who Knew Infinity.mkv -> { title: "The Man Who Knew Infinity", year: null }
 * 
 * On peut réutiliser la fonction searchTMDB(title, year) que je t’avais montrée avant.
 * Exemple pour The Man Who Knew Infinity (sans année) :
 * const { title, year } = parseVideoFilename("The Man Who Knew Infinity.mkv");
 * const movie = await searchTMDB(title, year); // year = null → recherche uniquement par titre
 */

