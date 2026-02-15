🎯 Objectif

📥 Entrée
{
  "username": "string",
  "password": "string"
}

⚙️ Traitement attendu
- vérification de la validité des données entrées
- Recherche dans users.json avec username = :username and passworddd = :password
- si non trouvé: message/erreur

📤 Sortie
SessionId valide, contexte utilisateur attaché:
{
  "sessionId": "string",
  "user": {
    "id": "string",
    "name": "string"
  }
}

📏 Critères
- Temps < X ms
- Session valide créée