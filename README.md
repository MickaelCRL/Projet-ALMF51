# Visualisation et Algorithmes de Graphes sur un Réseau Routier Français

Ce projet a pour but d'explorer différents algorithmes fondamentaux de graphes à travers la représentation d’un réseau routier simplifié entre plusieurs villes françaises.  
Les villes sont représentées par des sommets et les routes par des arêtes pondérées (distances ou coûts).

L’application permet d’implémenter, visualiser et expérimenter différents algorithmes vus en cours, tout en interagissant avec le graphe fourni.

---

## 🧭 Contexte

Le graphe pondéré représente un réseau de routes entre plusieurs villes de France. Chaque nœud correspond à une ville, et chaque arête à une liaison routière avec un poids associé (distance ou coût).

Ce projet s’inscrit dans le cadre du cours de graphes de l’**EFREI Paris (ALMF51)** et vise à appliquer de manière pratique les notions vues en cours à travers du code.

---

## 🎯 Objectifs

L’application permet d’expérimenter plusieurs algorithmes de graphes sur un graphe fixe :

### 1. **Parcours**
- Parcours en largeur (**BFS**)
- Parcours en profondeur (**DFS**)

### 2. **Arbre couvrant de poids minimal**
- Algorithme de **Kruskal**
- Algorithme de **Prim**

### 3. **Recherche de plus court chemin**
- Algorithme de **Dijkstra**
- Algorithmes de **Bellman-Ford** et **Floyd-Warshall**

---

## ⚙️ Installation et exécution

Le projet se compose de **deux parties** :
- une **interface front-end (React + TypeScript)** pour la visualisation,  
- et une **API back-end** (en C# / .NET) qui exécute les calculs d’algorithmes.

---

### Démarrer l'application

1. Ouvre un terminal dans le dossier app.
2. Installe les dépendances :
   ```bash
   npm install
   ```
3. Fais : 
   ```bash
   npm run dev
   ```
4. Double clique sur le lien qui apparait sur ton terminal.
5. Dans le dossier api double clique sur api.sln et lance le code.
6. Reviens sur l'interface web.
7. Parcours les graphes.
