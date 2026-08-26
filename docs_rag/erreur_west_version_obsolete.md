# Erreur : west "invalid choice: 'post-init'"

## Symptômes
Une commande west échoue en indiquant qu'un choix comme "post-init"
n'est pas reconnu, alors qu'elle est documentée.

## Cause réelle (source officielle Zephyr)
Une version trop ancienne de l'outil west est installée, incompatible
avec les commandes attendues par le projet.

## Solution
Mettre à jour west avec pip : `pip3 install -U west`
Sauvegarder le contenu de zephyrproject/.west/config avant si besoin.

Source : documentation officielle Zephyr, west/troubleshooting.rst