#!/bin/bash

# Test de différents trajets dans le métro parisien

echo "🚇 Tests du métro parisien avec le moteur LinkLab"
echo "=================================================="
echo ""

# Trajet 1 : Châtelet → Opéra
echo "📍 Trajet 1 : Châtelet → Opéra"
echo "Expected: Ligne 7 ou Ligne 1"
echo ""
# (Vous lancerez: tsx cli/run-scenario.ts scenarios/test-metro-paris)

# Trajet 2 : République → Bastille
echo "📍 Trajet 2 : République → Bastille"
echo "Expected: Ligne 5, 8 ou 9 possibles"
echo ""

# Trajet 3 : Gare du Nord → Montparnasse
echo "📍 Trajet 3 : Gare du Nord → Montparnasse"
echo "Expected: Ligne 4 direct"
echo ""

# Trajet 4 : La Défense → Château de Vincennes
echo "📍 Trajet 4 : La Défense → Château de Vincennes"
echo "Expected: Ligne 1 direct (terminus à terminus)"
echo ""

echo "✅ Pour tester, utilisez:"
echo "   tsx cli/run-scenario.ts scenarios/test-metro-paris"
