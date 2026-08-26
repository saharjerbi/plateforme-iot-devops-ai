# Comment lancer un premier build Zephyr (Blinky)

## Contexte
Une fois l'environnement Zephyr installé (SDK + west workspace), voici la procédure standard pour compiler et flasher un premier exemple. L'exemple "blinky" (LED qui clignote) est le "Hello World" de l'embarqué : il ne nécessite qu'une LED sur la carte, donc il marche sur quasiment toutes les cartes supportées.

## Prérequis
- Un west workspace fonctionnel (voir erreur_west_hors_workspace.md si `west build` n'est pas reconnu)
- Le Zephyr SDK installé (toolchain de compilation pour ta carte cible)
- Une carte de développement connectée en USB (ex: Nucleo, Discovery, nRF5x, ESP32)

## Procédure complète

### 1. Se placer dans le workspace
```bash
cd ~/zephyrproject
```

### 2. Lancer le build
```bash
west build -p always -b <nom_de_la_carte> samples/basic/blinky
```
Détail des options :
- `-p always` : "pristine" — force un build propre en supprimant les fichiers d'un ancien build. Recommandé en début de projet et à chaque changement de carte cible, pour éviter des erreurs de cache de build résiduelles.
- `-b <nom_de_la_carte>` : la carte cible, ex: `nucleo_f401re`, `nrf52840dk/nrf52840`, `esp32s3_devkitc/esp32s3/procpu`.
- Le dernier argument est le chemin de l'application, ici `samples/basic/blinky` (relatif au dépôt zephyr).

Le résultat du build se trouve dans `build/` à la racine du workspace : `build/zephyr/zephyr.elf`, `zephyr.hex`, `zephyr.bin`.

### 3. Flasher la carte
```bash
west flash
```
West détecte automatiquement la méthode de flash selon la carte (OpenOCD, pyOCD, JLink, esptool...). La LED de la carte doit se mettre à clignoter.

### 4. (Optionnel) Voir les logs de la carte
```bash
west build -t menuconfig   # configurer l'application
west logs                  # selon le runner
minicom -D /dev/ttyACM0    # ou picocom, selon la carte
```

## Trouver le nom exact de sa carte
Si le nom de la carte cible n'est pas connu, lister toutes les cartes supportées :
```bash
west boards
```
Filtre avec grep pour trouver la tienne :
```bash
west boards | grep nucleo
```

## Erreurs fréquentes au premier build
- **`west build` non reconnu** → tu es hors workspace, voir erreur_west_hors_workspace.md.
- **`No board named ... found`** → nom de carte incorrect, utilise `west boards` pour lister.
- **`Missing or invalid Zephyr SDK`** → le SDK n'est pas installé ou pas dans le PATH. Réinstalle-le et source `zephyr-sdk-*/environment-setup-*`.
- **Erreurs de compilation étranges après un changement de carte** → relance avec `-p always` pour un build propre.
- **`DT overlay` / `devicetree` errors** → la carte n'a pas de LED définie pour blinky ; vérifie la doc de la carte sur docs.zephyrproject.org.

## Note pratique pour la démo
Le cycle complet build → flash → vérification prend 1 à 3 minutes selon la carte. Pour un premier build, garde `-p always` : plus lent mais évite 90% des erreurs incompréhensibles.

Source : documentation officielle Zephyr, Getting Started Guide (docs.zephyrproject.org/latest/develop/getting_started)