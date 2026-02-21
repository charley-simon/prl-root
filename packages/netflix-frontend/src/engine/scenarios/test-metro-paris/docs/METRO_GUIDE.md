# 🚇 Métro Parisien avec LinkLab

## ✅ Fichiers prêts

Vous avez déjà tout ce qu'il faut :

- ✅ **graph.json** (1228 relations)
  - Trajets directs entre stations
  - Correspondances avec temps de marche
  - Poids en minutes
  
- ✅ **metro_paris.json** (données sources RATP)
  - Toutes les lignes 1-14
  - Coordonnées GPS
  - Temps précis

## 🎯 Utilisation

### 1. Copier le scénario dans votre projet

```bash
cp -r test-metro-paris/ /path/to/your/engine/scenarios/
```

### 2. Tester un trajet

```bash
tsx cli/run-scenario.ts scenarios/test-metro-paris
```

**Configuration actuelle :** Châtelet → Opéra

### 3. Modifier le trajet

Éditez `scenarios/test-metro-paris/config.json` :

```json
{
  "mode": "PATHFIND",
  "pathQuery": {
    "from": "Station-chatelet",
    "to": "Station-opera",
    "maxPaths": 5
  }
}
```

**Changez `from` et `to` pour tester d'autres trajets.**

## 📊 Exemples de stations

### Grandes correspondances
- `Station-chatelet` (Lignes 1, 4, 7, 11, 14)
- `Station-republique` (Lignes 3, 5, 8, 9, 11)
- `Station-montparnasse-bienvenue` (Lignes 4, 6, 12, 13)
- `Station-saint-lazare` (Lignes 3, 12, 13, 14)

### Terminus
- `Station-la-defense-grande-arche` (Ligne 1)
- `Station-chateau-de-vincennes` (Ligne 1)
- `Station-porte-de-clignancourt` (Ligne 4)
- `Station-mairie-de-montrouge` (Ligne 4)

## 🔍 Noms des stations

**Important :** Les noms sont normalisés :
- Minuscules
- Tirets au lieu d'espaces
- Préfixe `Station-`

Exemples :
- "Châtelet" → `Station-chatelet`
- "Gare du Nord" → `Station-gare-du-nord`
- "Saint-Michel Notre-Dame" → `Station-saint-michel-notre-dame`

## 📈 Résultats attendus

Le moteur devrait retourner :

```
STEP 1 (t=0) [PATHFIND/]
  Path: Station-chatelet → Station-pyramides → Station-opera (weight: 3)

💡 Toutes les connexions trouvées :
  1. Station-chatelet → Station-pyramides → Station-opera (weight: 3)
  2. Station-chatelet → Station-palais-royal → Station-opera (weight: 5)
```

### Interprétation du poids (weight)
- **Weight** = Temps total en minutes
- Inclut : temps de trajet + temps de correspondance
- Plus petit weight = trajet le plus rapide

## 🎯 Trajets intéressants à tester

### 1. Châtelet → Opéra
**Expected :** Ligne 7 (2 stations, ~3min)

### 2. La Défense → Château de Vincennes
**Expected :** Ligne 1 directe (25 stations, terminus à terminus)

### 3. Gare du Nord → Montparnasse
**Expected :** Ligne 4 directe

### 4. République → Bastille
**Expected :** Plusieurs chemins possibles (lignes 5, 8, 9)

### 5. Porte d'Orléans → Porte de Clignancourt
**Expected :** Ligne 4 complète (Nord-Sud)

## 🔧 Données techniques

### Format des relations

```json
{
  "name": "Station-chatelet--Station-pyramides--l7-dir0",
  "fromEntity": "Station-chatelet",
  "toEntity": "Station-pyramides",
  "via": "Ligne-7",
  "weight": 2,
  "metadata": {
    "type": "DIRECT",
    "lineId": "7",
    "lineName": "Ligne 7",
    "direction": "Mairie d'Ivry",
    "travelTimeMinutes": 2,
    "travelTimeSeconds": 120
  }
}
```

### Format des correspondances

```json
{
  "name": "transfer--Station-chatelet--l1--l7",
  "fromEntity": "Station-chatelet",
  "toEntity": "Station-chatelet",
  "via": "Correspondance",
  "weight": 5,
  "metadata": {
    "type": "TRANSFER",
    "fromLine": "1",
    "toLine": "7",
    "walkTimeMinutes": 5,
    "walkTimeSeconds": 300
  }
}
```

## 🚀 Prochaines étapes possibles

1. **Visualisation** : Afficher le trajet sur une carte
2. **Temps réel** : Intégrer les perturbations RATP
3. **Optimisation** : Préférer moins de correspondances
4. **Accessibilité** : Filtrer par stations accessibles PMR
5. **Horaires** : Prendre en compte les heures de pointe

## 💡 Astuces

### Trouver le nom exact d'une station

```bash
grep -i "chatelet" scenarios/test-metro-paris/graph.json | head -5
```

### Compter les chemins trouvés

Le moteur retourne jusqu'à `maxPaths` chemins (défaut: 5).

### Debug

Si aucun chemin n'est trouvé :
- Vérifier l'orthographe des noms de stations
- Vérifier le préfixe `Station-`
- Vérifier que les stations existent bien dans le graph

## 📊 Statistiques du graph

- **Stations :** ~300
- **Relations totales :** 1228
  - Trajets directs : ~1000
  - Correspondances : ~200
- **Lignes :** 14 (1 à 14)
- **Temps moyen entre stations :** 1-2 minutes
- **Temps moyen correspondance :** 3-5 minutes

## ✅ C'est prêt !

Votre moteur LinkLab peut maintenant :
- ✅ Trouver le chemin le plus rapide
- ✅ Trouver plusieurs chemins alternatifs
- ✅ Calculer le temps total de trajet
- ✅ Gérer les correspondances intelligemment

**Amusez-vous bien !** 🚇
