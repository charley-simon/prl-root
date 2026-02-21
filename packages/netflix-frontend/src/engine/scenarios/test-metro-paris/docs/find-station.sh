#!/bin/bash

# Helper pour chercher des stations du métro parisien

if [ $# -eq 0 ]; then
    echo "Usage: ./find-station.sh <search-term>"
    echo ""
    echo "Exemples:"
    echo "  ./find-station.sh chatelet"
    echo "  ./find-station.sh republique"
    echo "  ./find-station.sh opera"
    echo ""
    echo "Nombre total de stations: 312"
    exit 1
fi

SEARCH_TERM="$1"

echo "🔍 Recherche de stations contenant: '$SEARCH_TERM'"
echo ""

grep -i "$SEARCH_TERM" stations-list.txt

COUNT=$(grep -i "$SEARCH_TERM" stations-list.txt | wc -l)

echo ""
echo "✅ $COUNT station(s) trouvée(s)"
