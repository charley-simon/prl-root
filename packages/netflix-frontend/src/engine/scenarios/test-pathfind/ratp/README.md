# 🚇 Paris Métro GTFS — TypeScript

Récupère les données complètes du métro parisien (RATP) depuis le GTFS officiel
d'Île-de-France Mobilités et les exporte en JSON structuré.

## Ce que le script produit

Un fichier `output/metro_paris.json` avec, pour chaque ligne de métro :
- L'ordre des stations dans les **deux sens** (aller/retour)
- Les **coordonnées GPS** de chaque station
- Les **correspondances** avec les autres lignes (+ temps de transfert en secondes/minutes)
- La couleur officielle de la ligne

### Exemple de sortie

```json
{
  "Ligne 1": {
    "lineId": "IDFM:C01371",
    "lineName": "1",
    "fullName": "La Défense - Château de Vincennes",
    "color": "#FFCD00",
    "direction0": [
      {
        "order": 1,
        "id": "IDFM:463079",
        "name": "La Défense (Grande Arche)",
        "travelSecondsFromPrev": null,
        "coordinates": { "lat": 48.891891, "lon": 2.238762 },
        "connections": []
      },
      {
        "order": 5,
        "id": "IDFM:21965",
        "name": "Châtelet",
        "travelSecondsFromPrev": 120,
        "coordinates": { "lat": 48.8601, "lon": 2.3469 },
        "connections": [
          {
            "toStationId": "IDFM:463079",
            "toStationName": "Châtelet",
            "toLineId": "11",
            "toLineName": "Ligne 11",
            "transferTimeSeconds": 180,
            "transferTimeMinutes": 3
          }
        ]
      }
    ],
    "direction1": [ ... ]
  }
}
```

## Installation

```bash
npm install
```

## Utilisation

```bash
# Développement (sans compilation)
npm run dev

# Production (compile + exécute)
npm run fetch
```

## Source des données

- **GTFS IDFM** : https://data.iledefrance-mobilites.fr/explore/dataset/offre-horaires-tc-gtfs-idfm/
- Données officielles, mises à jour **3 fois par jour**
- Licence : Licence Ouverte / Open Licence v2.0

## Cache local

Le GTFS (~50 Mo zippé) est mis en cache dans `.cache/gtfs.zip` après le premier
téléchargement. Pour forcer une mise à jour, supprimez ce fichier :

```bash
rm -rf .cache/
```

## Structure des fichiers GTFS utilisés

| Fichier         | Usage                                      |
|----------------|--------------------------------------------|
| `routes.txt`   | Lignes (filtrées sur `route_type=1` = métro)|
| `trips.txt`    | Un trajet par ligne et par direction        |
| `stop_times.txt`| Ordre et horaires des stations par trajet  |
| `stops.txt`    | Nom et coordonnées GPS de chaque station    |
| `transfers.txt`| Correspondances et temps de transfert       |
