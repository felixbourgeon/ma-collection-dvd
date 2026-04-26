const dvdList = document.getElementById('dvdList');
const searchInput = document.getElementById('searchInput');
const watchlistFilter = document.getElementById('watchlistFilter');
const sortSelect = document.getElementById('sortSelect');
const paginationContainer = document.getElementById('pagination');

let mesDVDs = [];
let watchlist = JSON.parse(localStorage.getItem('maWatchlist')) || [];
let pageActuelle = 1;
const filmsParPage = 40;

// On utilise ton lien avec anti-cache pour être sûr d'avoir les bonnes infos
fetch('dvds.json?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        mesDVDs = data;
        majAffichage();
    })
    .catch(error => {
        console.error("Erreur :", error);
        dvdList.innerHTML = "<p>Erreur de chargement des films.</p>";
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
    // 1. On filtre
    const recherche = searchInput.value.toLowerCase();
    const neVoirQueWatchlist = watchlistFilter.checked;

    let filmsResultats = mesDVDs.filter(dvd => {
        const matchTexte = (dvd.titre + (dvd.real || "") + (dvd.annee || "") + (dvd.rangement || "")).toLowerCase().includes(recherche);
        const matchWatchlist = neVoirQueWatchlist ? watchlist.includes(dvd.id) : true;
        return matchTexte && matchWatchlist;
    });

    // 2. On trie
    const [critere, ordre] = sortSelect.value.split('-');
    filmsResultats.sort((a, b) => {
        let aVal = a[critere] ? a[critere].toString().toLowerCase() : "";
        let bVal = b[critere] ? b[critere].toString().toLowerCase() : "";
        
        if (critere === "annee") {
            aVal = parseInt(aVal) || 0;
            bVal = parseInt(bVal) || 0;
        }

        if (ordre === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    });

    // 3. On pagine
    const totalPages = Math.ceil(filmsResultats.length / filmsParPage) || 1;
    if (pageActuelle > totalPages) pageActuelle = 1;
    
    const debut = (pageActuelle - 1) * filmsParPage;
    const filmsAPresenter = filmsResultats.slice(debut, debut + filmsParPage);

    afficherFilms(filmsAPresenter);
    genererPagination(totalPages);
}

function afficherFilms(films) {
    dvdList.innerHTML = "";
    if (films.length === 0) {
        dvdList.innerHTML = "<p>Aucun film trouvé.</p>";
        return;
    }

    films.forEach(dvd => {
        const estDansWatchlist = watchlist.includes(dvd.id);
        const card = document.createElement('div');
        card.className = `dvd-card ${estDansWatchlist ? 'watchlist' : ''}`;
        card.innerHTML = `
            <div>
                <h3>${dvd.titre || 'Sans titre'}</h3>
                <p><strong>Réalisateur :</strong> ${dvd.real || 'Inconnu'}</p>
                <p><strong>Année :</strong> ${dvd.annee || 'N/C'}</p>
                <p><strong>Rangement :</strong> ${dvd.rangement || 'Non classé'}</p>
            </div>
            <button onclick="toggleWatchlist(${dvd.id})">
                ${estDansWatchlist ? '❌ Retirer' : '⭐ Watchlist'}
            </button>
        `;
        dvdList.appendChild(card);
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
            window.scrollTo(0, 0);
        };
        paginationContainer.appendChild(btn);
    }
}

// Écouteurs
searchInput.addEventListener('input', () => { pageActuelle = 1; majAffichage(); });
watchlistFilter.addEventListener('change', () => { pageActuelle = 1; majAffichage(); });
sortSelect.addEventListener('change', majAffichage);