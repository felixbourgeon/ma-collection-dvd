const dvdList = document.getElementById('dvdList');
const searchInput = document.getElementById('searchInput');
const watchlistFilter = document.getElementById('watchlistFilter');
const sortSelect = document.getElementById('sortSelect');
const paginationContainer = document.getElementById('pagination');

let mesDVDs = [];
let watchlist = JSON.parse(localStorage.getItem('maWatchlist')) || [];
let pageActuelle = 1;
const filmsParPage = 40;

// Chargement des données
fetch('dvds.json?v=' + new Date().getTime())
    .then(res => res.json())
    .then(data => {
        mesDVDs = data;
        majAffichage();
    })
    .catch(err => {
        console.error(err);
        dvdList.innerHTML = "Erreur de chargement des données.";
    });

function majAffichage() {
    let films = mesDVDs.filter(dvd => {
        const recherche = searchInput.value.toLowerCase();
        const matchTexte = (dvd.titre + (dvd.real || "") + (dvd.annee || "") + (dvd.rangement || "")).toLowerCase().includes(recherche);
        const matchWatchlist = watchlistFilter.checked ? watchlist.includes(dvd.id) : true;
        return matchTexte && matchWatchlist;
    });

    // Logique de tri améliorée
    const [critere, ordre] = sortSelect.value.split('-');
    films.sort((a, b) => {
        let aVal = a[critere] ? a[critere].toString().toLowerCase() : "";
        let bVal = b[critere] ? b[critere].toString().toLowerCase() : "";
        
        if (ordre === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    });

    // Pagination
    const totalPages = Math.ceil(films.length / filmsParPage);
    const debut = (pageActuelle - 1) * filmsParPage;
    const filmsAffiches = films.slice(debut, debut + filmsParPage);

    afficherCards(filmsAffiches);
    afficherPagination(totalPages);
}

function afficherCards(films) {
    dvdList.innerHTML = "";
    films.forEach(dvd => {
        const estDansWatchlist = watchlist.includes(dvd.id);
        const card = document.createElement('div');
        card.className = `dvd-card ${estDansWatchlist ? 'watchlist' : ''}`;
        card.innerHTML = `
            <h3>${dvd.titre || "Sans titre"}</h3>
            <p>Réalisateur : ${dvd.real || "Inconnu"}</p>
            <p>Année : ${dvd.annee || "N/C"}</p>
            <p>Rangement : ${dvd.rangement || "Non classé"}</p>
            <button onclick="changerWatchlist(${dvd.id})">${estDansWatchlist ? '❌ Retirer' : '⭐ Watchlist'}</button>
        `;
        dvdList.appendChild(card);
    });
}

function changerWatchlist(id) {
    if (watchlist.includes(id)) {
        watchlist = watchlist.filter(item => item !== id);
    } else {
        watchlist.push(id);
    }
    localStorage.setItem('maWatchlist', JSON.stringify(watchlist));
    majAffichage();
}

function afficherPagination(total) {
    paginationContainer.innerHTML = "";
    if (total <= 1) return;
    for (let i = 1; i <= total; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `page-btn ${i === pageActuelle ? 'active' : ''}`;
        btn.onclick = () => { pageActuelle = i; majAffichage(); window.scrollTo(0,0); };
        paginationContainer.appendChild(btn);
    }
}

searchInput.oninput = () => { pageActuelle = 1; majAffichage(); };
watchlistFilter.onchange = () => { pageActuelle = 1; majAffichage(); };
sortSelect.onchange = () => majAffichage();