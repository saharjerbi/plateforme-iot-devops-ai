# Erreur : west "invalid choice: 'post-init'"

## Symptômes
Une commande west échoue en indiquant qu'un choix n'est pas reconnu, alors qu'elle est documentée :

```
west: error: argument command: invalid choice: 'post-init' (choose from 'init', 'update', ...)
```

ou toute autre commande récente de west refusée par ton installation. Contrairement à l'erreur "hors workspace" (voir erreur_west_hors_workspace.md), ici la commande échoue **même depuis l'intérieur du workspace**.

## Cause réelle (source officielle Zephyr)
Une **version trop ancienne de l'outil west** est installée. Zephyr évolue vite, et les versions de west sont liées aux versions de Zephyr :
- Les vieilles versions de west ne connaissent pas les commandes récentes (ex: `west post-init`, introduite pour simplifier `west init`).
- À l'inverse, un west trop récent peut être incompatible avec un vieux checkout Zephyr.

La version de west requise est indiquée dans le fichier `zephyr/scripts/west-requirements.txt` du dépôt Zephyr correspondant à ta version.

## Diagnostic
```bash
# Version de west installée
west --version

# Version de Zephyr dans ton workspace
cd ~/zephyrproject/zephyr
git describe --tags
```
Compare ensuite avec les prérequis de ta version de Zephyr (cf. release notes officielles).

## Solution
1. Mettre à jour west avec pip :
   ```bash
   pip3 install -U west
   ```
2. Vérifier la nouvelle version :
   ```bash
   west --version
   ```
3. Si tu as un doute avant la mise à jour, sauvegarder la config du workspace :
   ```bash
   cp -r ~/zephyrproject/.west/config ~/zephyrproject/.west/config.bak
   ```
4. Réaligner le workspace avec la nouvelle version de west si besoin :
   ```bash
   cd ~/zephyrproject
   west update
   ```

## Cas particuliers
- **Plusieurs Python / venv** : si west est installé dans un venv (recommandé : `~/zephyrproject/.venv`), assure-toi que le venv est activé avant `pip3 install -U west`, sinon tu mets à jour le mauvais west. Vérifie avec `which west`.
- **west installé par apt** : la version des dépôts Ubuntu est souvent obsolète. Désinstalle-la (`sudo apt remove west`) et utilise uniquement la version pip dans le venv.
- **Erreur persistante après update** : le workspace a peut-être été créé avec une structure ancienne. Le plus sûr est de refaire `west init` + `west update` dans un dossier neuf.

## Erreurs associées
- `west: error: unrecognized arguments` → même famille, options inconnues de la vieille version.
- Comportements bizarres après un `git pull` de Zephyr → souvent un west à mettre à jour.

Source : documentation officielle Zephyr, doc/develop/west/troubleshooting.rst