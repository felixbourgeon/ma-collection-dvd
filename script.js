const dvdList = document.getElementById('dvdList');
const searchInput = document.getElementById('searchInput');
const watchlistFilter = document.getElementById('watchlistFilter');
const sortSelect = document.getElementById('sortSelect');
const paginationContainer = document.getElementById('pagination');

let mesDVDs = [];
let watchlist = JSON.parse(localStorage.getItem('maWatchlist')) || [];
let pageActuelle = 1;
const filmsParPage = 40;

// Chargement sécurisé des données
fetch('dvds.json?v=' + new Date().getTime())
    .then(res => res.json())
    .then(data => {
        mesDVDs = data;
        majAffichage();
    })
    .catch(err => {
        console.error(err);
        if(dvdList) dvdList.innerHTML = "Erreur de chargement des données.";
    });

function majAffichage() {
    // 1. Filtrage
    let films = mesDVDs.filter(dvd => {
        const recherche = searchInput.value.toLowerCase();
        const matchTexte = (dvd.titre + (dvd.real || "") + (dvd.annee || "") + (dvd.rangement || "")).toLowerCase().includes(recherche);
        const matchWatchlist = watchlistFilter.checked ? watchlist.includes(dvd.id) : true;
        return matchTexte && matchWatchlist;
    });

    // 2. Tri (Titre, Réal, Année, Rangement)
    const [critere, ordre] = sortSelect.value.split('-');
    films.sort((a, b) => {
        let aVal = a[critere] ? a[critere].toString().toLowerCase() : "";
        let bVal = b[critere] ? b[critere].toString().toLowerCase() : "";
        
        if (critere === "annee") {
            aVal = parseInt(aVal) || 0;
            bVal = parseInt(bVal) || 0;
        }

        if (ordre === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    });

    // 3. Pagination (40 par page)
    const totalPages = Math.ceil(films.length / filmsParPage) || 1;
    const debut = (pageActuelle - 1) * filmsParPage;
    const filmsAffiches = films.slice(debut, debut + filmsParPage);

    afficherCards(filmsAffiches);
    afficherPagination(totalPages);
}

function afficherCards(films) {
    if(!dvdList) return;
    dvdList.innerHTML = films.length ? "" : "<p>Aucun film trouvé.</p>";
    
    films.forEach(dvd => {
        const estDansWatchlist = watchlist.includes(dvd.id);
        const card = document.createElement('div');
        card.className = `dvd-card ${estDansWatchlist ? 'watchlist' : ''}`;
        card.innerHTML = `
            <h3>${dvd.titre || "Sans titre"}</h3>
            <p><strong>Réalisateur :</strong> ${dvd.real || "Inconnu"}</p>
            <p><strong>Année :</strong> ${dvd.annee || "N/C"}</p>
            <p><strong>Rangement :</strong> ${dvd.rangement || "Non classé"}</p>
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
    if(!paginationContainer) return;
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

// Écouteurs d'événements
if(searchInput) searchInput.oninput = () => { pageActuelle = 1; majAffichage(); };
if(watchlistFilter) watchlistFilter.onchange = () => { pageActuelle = 1; majAffichage(); };
if(sortSelect) sortSelect.onchange = () => majAffichage();