# PahaeVideoPlayer

Lecteur vidéo desktop pour Windows, basé sur **Next.js** et **Electron**.

Interface moderne en glassmorphism, raccourcis clavier complets, association automatique aux fichiers vidéo Windows (double-clic ou "Ouvrir avec").

![Windows](https://img.shields.io/badge/platform-Windows-0078D6)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Electron](https://img.shields.io/badge/Electron-31-47848F)
![License](https://img.shields.io/badge/license-PolyForm--Noncommercial--1.0.0-orange)

## Aperçu

- Lecture de fichiers vidéo `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`, `.m4v`, `.wmv`
- Ouverture directe depuis l'Explorateur Windows (double-clic ou clic droit → Ouvrir avec)
- Interface sombre, glassmorphism, sans emoji, icônes [lucide-react](https://lucide.dev)
- Contrôles complets : lecture/pause, seek, volume, vitesse, plein écran, précédent/suivant
- Raccourcis clavier type lecteur professionnel
- Glisser-déposer de fichiers vidéo directement dans la fenêtre
- Gestion propre des états (chargement, erreur, aucune vidéo)

## Stack technique

- [Next.js](https://nextjs.org) (Pages Router, export statique)
- [React](https://react.dev)
- [Electron](https://www.electronjs.org)
- [TailwindCSS](https://tailwindcss.com)
- [lucide-react](https://lucide.dev)
- [electron-builder](https://www.electron.build)

## Structure du projet

```
pahaeVideoPlayer/
├── electron/
│   ├── main.js          processus principal Electron
│   └── preload.js       pont sécurisé contextBridge
├── pages/
│   ├── _app.jsx
│   └── index.jsx
├── components/
│   ├── videoPlayer.jsx  composant principal (état, clavier, drag & drop)
│   ├── controls.jsx     barre de contrôle inférieure
│   ├── shortcutsModal.jsx
│   └── speedModal.jsx
├── styles/
│   └── globals.css
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Installation

Prérequis : [Node.js](https://nodejs.org) 18 ou supérieur.

```bash
git clone https://github.com/oPahae/pahaeVideoPlayer.git
cd pahaeVideoPlayer
npm install
```

## Développement

```bash
npm run dev
```

Lance en parallèle le serveur Next.js (`localhost:3000`) et Electron, qui se connecte automatiquement dès que le serveur est prêt.

Pour tester l'ouverture d'un fichier vidéo en développement :

```bash
npx electron . "C:\Users\User\Videos\film test.mkv"
```

## Build Windows

```bash
npm run build
npm run dist
```

- `npm run build` exécute `next build` (export statique) → génère `out/`
- `npm run dist` génère l'installeur Windows dans `dist/PahaeVideoPlayer Setup.exe`

Pour un build sans packager l'installeur (test rapide) :

```bash
npm run pack
```

## Définir comme lecteur par défaut

Après installation :

1. Clic droit sur un fichier vidéo → **Ouvrir avec** → **Choisir une autre application**
2. Sélectionner **PahaeVideoPlayer**
3. Cocher **Toujours utiliser cette application**

Ou via **Paramètres Windows → Applications → Applications par défaut → Modification des applications par défaut des types de fichiers**, en associant chaque extension (`.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`, `.m4v`, `.wmv`) à PahaeVideoPlayer.

## Raccourcis clavier

| Touche | Action |
|---|---|
| `←` | Reculer 5 secondes |
| `→` | Avancer 5 secondes |
| `Ctrl + ←` | Reculer 10 secondes |
| `Ctrl + →` | Avancer 10 secondes |
| `K` | Reculer 200 ms |
| `L` | Avancer 200 ms |
| `↑` | Augmenter le volume |
| `↓` | Diminuer le volume |
| `M` | Muet / son |
| `S` | Ouvrir le sélecteur de vitesse |
| `0` | Revenir au début |
| `Espace` | Lecture / pause |
| `F11` | Plein écran |
| `Échap` | Fermer une popup, quitter le plein écran, ou quitter l'application |

## Débogage

Pour ouvrir les DevTools sur le build de production installé :

```powershell
$env:PAHAE_DEBUG="1"
& "C:\Users\<toi>\AppData\Local\Programs\PahaeVideoPlayer\PahaeVideoPlayer.exe"
```

## Licence

Ce projet est sous licence **[PolyForm Noncommercial 1.0.0](LICENSE)**.

Cela signifie que tu peux utiliser, modifier et redistribuer le code **gratuitement pour un usage non commercial** (usage personnel, éducatif, associatif, expérimentation). **La vente ou l'exploitation commerciale du logiciel n'est pas autorisée** sans l'accord explicite de l'auteur.
