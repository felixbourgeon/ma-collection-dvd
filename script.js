const dvdList = document.getElementById('dvdList');
const searchInput = document.getElementById('searchInput');
const watchlistFilter = document.getElementById('watchlistFilter');
const sortSelect = document.getElementById('sortSelect');
const paginationContainer = document.getElementById('pagination');

let mesDVDs = [];
let watchlist = JSON.parse(localStorage.getItem('maWatchlist')) || [];
let pageActuelle = 1;
const filmsParPage = 40;

fetch('dvds.json?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        mesDVDs = data;
        majAffichage();
    });

function toggleWatchlist(id) {
    if (watchlist.includes(id)) {
        watchlist = watchlist.filter(item => item !== id);
    } else {
        watchlist.push(id);
    }
    localStorage.setItem('maWatchlist', JSON.stringify(watchlist));
    majAffichage();
}

function majAffichage() {
    let films = filtrerFilms();
    films = trierFilms(films);
    
    // Calcul de la pagination
    const totalPages = Math.ceil(films.length / filmsParPage);
    if (pageActuelle > totalPages) pageActuelle = 1;

    const debut = (pageActuelle - 1) * filmsParPage;
    const fin = debut + filmsParPage;
    const filmsAPresenter = films.slice(debut, fin);

    afficherFilms(filmsAPresenter);
    genererPagination(totalPages);
}

function filtrerFilms() {
    const recherche = searchInput.value.toLowerCase();
    const filtreActif = watchlistFilter.checked;

    return mesDVDs.filter(dvd => {
        const matchTexte = ["titre", "real", "annee", "rangement"].some(key => 
            dvd[key] && dvd[key].toString().toLowerCase().includes(recherche)
        );
        const matchWatchlist = filtreActif ? watchlist.includes(dvd.id) : true;
        return matchTexte && matchWatchlist;
    });
}

function trierFilms(films) {
    const [critere, ordre] = sortSelect.value.split('-');
    return films.sort((a, b) => {
        let valA = a[critere] ? a[critere].toString().toLowerCase() : "";
        let valB = b[critere] ? b[critere].toString().toLowerCase() : "";
        
        // Si c'est l'année, on compare des nombres
        if (critere === "annee") {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        }

        if (valA < valB) return ordre === "asc" ? -1 : 1;
        if (valA > valB) return ordre === "asc" ? 1 : -1;
        return 0;
    });
}

function genererPagination(total) {
    paginationContainer.innerHTML = "";
    if (total <= 1) return;

    for (let i = 1; i <= total; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `page-btn ${i === pageActuelle ? 'active' : ''}`;
        btn.onclick = () => {
            pageActuelle = i;
            majAffichage();
            window.scrollTo(0, 0); // Remonte en haut de page
        };
        paginationContainer.appendChild(btn);
    }
}

function afficherFilms(films) {
    dvdList.innerHTML = films.length ? "" : "<p>Aucun film trouvé.</p>";
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

// Écouteurs
searchInput.addEventListener('input', () => { pageActuelle = 1; majAffichage(); });
watchlistFilter.addEventListener('change', () => { pageActuelle = 1; majAffichage(); });
sortSelect.addEventListener('change', majAffichage);