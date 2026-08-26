# Erreur : west build "invalid choice: 'build'"

## Symptômes
La commande `west build` (ou `west flash`) renvoie une erreur du type
"invalid choice: 'build'" alors que la commande semble correcte.

## Cause réelle (source officielle Zephyr)
Cette erreur signifie presque toujours que la commande est lancée
en dehors d'un "west workspace" — le dossier créé lors de l'installation
initiale de Zephyr (généralement nommé zephyrproject). West a besoin
de connaître ce dossier pour savoir où chercher les extensions comme
"build" ou "flash".

## Solution
Se placer dans le dossier de workspace créé au moment du `west init`
(ex: `cd ~/zephyrproject`) avant de relancer la commande.

Source : documentation officielle Zephyr, west/troubleshooting.rst