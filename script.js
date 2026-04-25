const dvdList = document.getElementById('dvdList');
const searchInput = document.getElementById('searchInput');
const watchlistFilter = document.getElementById('watchlistFilter');

let mesDVDs = []; // On part d'une liste vide
let watchlist = JSON.parse(localStorage.getItem('maWatchlist')) || [];

// 1. CHARGEMENT DES DONNÉES DEPUIS LE FICHIER JSON
fetch('dvds.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("Erreur lors du chargement du fichier JSON");
        }
        return response.json();
    })
    .then(data => {
        mesDVDs = data; // On stocke les données reçues
        majAffichage(); // On lance le premier affichage
    })
    .catch(error => {
        console.error("Erreur :", error);
        dvdList.innerHTML = "<p>Erreur de chargement des films. Vérifiez le fichier dvds.json.</p>";
    });

// 2. LOGIQUE DE LA WATCHLIST
function toggleWatchlist(id) {
    if (watchlist.includes(id)) {
        watchlist = watchlist.filter(item => item !== id);
    } else {
        watchlist.push(id);
    }
    localStorage.setItem('maWatchlist', JSON.stringify(watchlist));
    majAffichage();
}

// 3. LOGIQUE DE FILTRAGE (Recherche + Checkbox)
function majAffichage() {
    const recherche = searchInput.value.toLowerCase();
    const filtreActif = watchlistFilter.checked;

    const filmsFiltres = mesDVDs.filter(dvd => {
        const matchTexte = 
            (dvd.titre && dvd.titre.toLowerCase().includes(recherche)) || 
            (dvd.real && dvd.real.toLowerCase().includes(recherche)) ||
            (dvd.annee && dvd.annee.toString().includes(recherche)) ||
            (dvd.rangement && dvd.rangement.toLowerCase().includes(recherche));
        
        const matchWatchlist = filtreActif ? watchlist.includes(dvd.id) : true;

        return matchTexte && matchWatchlist;
    });

    afficherFilms(filmsFiltres);
}

// 4. GÉNÉRATION DES CARTES HTML
function afficherFilms(films) {
    dvdList.innerHTML = "";
    
    if (films.length === 0) {
        dvdList.innerHTML = "<p>Aucun film ne correspond à votre recherche.</p>";
        return;
    }

    films.forEach(dvd => {
        const estDansWatchlist = watchlist.includes(dvd.id);
        const card = document.createElement('div');
        card.className = `dvd-card ${estDansWatchlist ? 'watchlist' : ''}`;
        
        card.innerHTML = `
            <div>
                <h3>${dvd.titre || 'Sans titre'}</h3>
                <p><strong>Réal :</strong> ${dvd.real || 'Inconnu'}</p>
                <p><strong>Année :</strong> ${dvd.annee || 'N/C'}</p>
                <p><strong>Lieu :</strong> ${dvd.rangement || 'Non classé'}</p>
            </div>
            <button onclick="toggleWatchlist(${dvd.id})">
                ${estDansWatchlist ? '❌ Retirer' : '⭐ Watchlist'}
            </button>
        `;
        dvdList.appendChild(card);
    });
}

// Écouteurs d'événements
searchInput.addEventListener('input', majAffichage);
watchlistFilter.addEventListener('change', majAffichage);