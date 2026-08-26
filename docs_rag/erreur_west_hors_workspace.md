# Erreur : west build "invalid choice: 'build'"

## Symptômes
La commande `west build` (ou `west flash`, `west sign`, etc.) renvoie une erreur du type :

```
west: error: argument command: invalid choice: 'build' (choose from 'config', 'topdir', 'list', 'manifest', ...)
```

alors que la commande semble correcte et documentée. La liste de choix proposée ne contient jamais "build", "flash" ou "sign".

## Cause réelle (source officielle Zephyr)
Cette erreur signifie presque toujours que la commande est lancée **en dehors d'un "west workspace"**.

Un west workspace est le dossier créé lors de l'installation initiale de Zephyr (généralement nommé `zephyrproject`, créé par `west init` puis `west update`). West fonctionne en deux niveaux :
- Les commandes **intégrées** (builtin) : `config`, `topdir`, `list`, `manifest`, `help`, `version` — elles marchent partout.
- Les commandes **extensions** : `build`, `flash`, `debug`, `sign`, `run`, etc. — elles sont fournies par le code de Zephyr (`zephyr/scripts/west_commands`) et west ne les trouve QUE s'il sait où est le workspace.

Si tu es hors workspace, west ne charge pas les extensions, donc "build" n'existe pas pour lui → "invalid choice".

## Diagnostic
```bash
# Vérifie où tu es et si un workspace existe au-dessus de toi
west topdir
```
- Si la commande échoue avec "not a west workspace" → tu es hors workspace, c'est confirmé.
- Si elle renvoie un chemin (ex: `/home/user/zephyrproject`) → le problème est ailleurs (version de west, voir doc erreur_west_version_obsolete.md).

## Solution
1. Se placer dans le dossier du workspace créé au moment du `west init` :
   ```bash
   cd ~/zephyrproject
   ```
2. Vérifier que les extensions sont maintenant visibles :
   ```bash
   west help
   ```
   → tu dois voir "build", "flash", etc. dans la liste.
3. Relancer la commande :
   ```bash
   west build -p always -b <carte> samples/basic/blinky
   ```

## Cas particuliers
- **Workspace déplacé ou renommé** : si tu as déplacé le dossier `zephyrproject`, le lien interne (`.west/config`) peut pointer vers l'ancien chemin. Édite `zephyrproject/.west/config` pour corriger le chemin de `zephyr`.
- **Workspace cloné depuis git** : le dossier `.west/` n'est PAS versionné par git. Si tu as cloné un projet Zephyr sans faire `west init` toi-même, il te manque le workspace. Refais l'installation : `west init -l zephyr` depuis l'intérieur du clone.
- **Sous-dossier profond** : tu peux être dans un sous-dossier du workspace, c'est OK — west remonte les dossiers jusqu'à trouver `.west/`. Mais si tu es dans un dossier frère (ex: `~/autre-projet`), il ne trouvera jamais.

## Erreurs associées
- `west: fatal: not a west workspace` → même cause, message plus explicite.
- `invalid choice: 'flash'`, `invalid choice: 'sign'` → même cause, autre extension.

Source : documentation officielle Zephyr, doc/develop/west/troubleshooting.rst