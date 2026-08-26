# Comment lancer un premier build Zephyr (Blinky)

## Contexte
Une fois l'environnement Zephyr installé (SDK + west), voici la
procédure standard pour compiler et flasher un premier exemple.

## Procédure
1. Se placer dans le dossier zephyr du workspace
2. Lancer : `west build -p always -b <nom_de_la_carte> samples/basic/blinky`
   (l'option -p always force une compilation propre, utile en début
   de projet pour éviter des fichiers résiduels d'un ancien build)
3. Flasher avec : `west flash`

## Note pratique
Si la carte cible n'est pas connue, lister les cartes disponibles avec :
`west boards`

Source : documentation officielle Zephyr, Getting Started Guide