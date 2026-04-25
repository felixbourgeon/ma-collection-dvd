const dvdList = document.getElementById('dvdList');
const searchInput = document.getElementById('searchInput');

// 1. Tes données (on les remet ici pour plus de simplicité au début)
let mesDVDs = [
    { id: 1, titre: "Inception", real: "Christopher Nolan", annee: 2010, rangement: "Étagère A" },
    { id: 2, titre: "Pulp Fiction", real: "Quentin Tarantino", annee: 1994, rangement: "Salon" },
    { id: 3, titre: "Interstellar", real: "Christopher Nolan", annee: 2014, rangement: "Étagère A" }
];

// 2. Gestion de la Watchlist (récupération depuis la mémoire du navigateur)
let watchlist = JSON.parse(localStorage.getItem('maWatchlist')) || [];

function toggleWatchlist(id) {
    if (watchlist.includes(id)) {
        watchlist = watchlist.filter(item => item !== id); // On l'enlève
    } else {
        watchlist.push(id); // On l'ajoute
    }
    localStorage.setItem('maWatchlist', JSON.stringify(watchlist));
    afficherFilms(filtrerFilms()); // On rafraîchit l'affichage
}

// 3. Fonction de filtrage avancée
function filtrerFilms() {
    const recherche = searchInput.value.toLowerCase();
    return mesDVDs.filter(dvd => {
        return dvd.titre.toLowerCase().includes(recherche) || 
               dvd.real.toLowerCase().includes(recherche) ||
               dvd.annee.toString().includes(recherche) ||
               dvd.rangement.toLowerCase().includes(recherche);
    });
}

// 4. Affichage des films
function afficherFilms(films) {
    dvdList.innerHTML = "";
    films.forEach(dvd => {
        const estDansWatchlist = watchlist.includes(dvd.id);
        const card = document.createElement('div');
        card.className = `dvd-card ${estDansWatchlist ? 'watchlist' : ''}`;
        
        card.innerHTML = `
            <h3>${dvd.titre}</h3>
            <p><strong>Réalisateur :</strong> ${dvd.real} (${dvd.annee})</p>
            <p><strong>Rangement :</strong> ${dvd.rangement}</p>
            <button onclick="toggleWatchlist(${dvd.id})">
                ${estDansWatchlist ? '❌ Retirer' : '⭐ Watchlist'}
            </button>
        `;
        dvdList.appendChild(card);
    });
}

// Écouteur d'événement pour la recherche
searchInput.addEventListener('input', () => {
    afficherFilms(filtrerFilms());
});

// Lancement initial
afficherFilms(mesDVDs);