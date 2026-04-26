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
    .then(res => res.json())
    .then(data => {
        mesDVDs = data;
        majAffichage();
    })
    .catch(err => {
        console.error(err);
        dvdList.innerHTML = "Erreur de chargement des films.";
    });

function majAffichage() {
    const recherche = searchInput.value.toLowerCase();
    
    let resultats = mesDVDs.filter(dvd => {
        const matchTexte = (dvd.titre + (dvd.real || "") + (dvd.annee || "") + (dvd.rangement || "")).toLowerCase().includes(recherche);
        const matchWatchlist = watchlistFilter.checked ? watchlist.includes(dvd.id) : true;
        return matchTexte && matchWatchlist;
    });

    // Mise à jour du compteur
    const countElement = document.getElementById('movieCount');
    if (countElement) {
        countElement.innerText = `${resultats.length} film${resultats.length > 1 ? 's' : ''}`;
    }

    const [critere, ordre] = sortSelect.value.split('-');
    resultats.sort((a, b) => {
        let valA = a[critere] ? a[critere].toString().toLowerCase() : "";
        let valB = b[critere] ? b[critere].toString().toLowerCase() : "";
        if (critere === "annee") {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        }
        if (ordre === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
    });

    const totalPages = Math.ceil(resultats.length / filmsParPage) || 1;
    if (pageActuelle > totalPages) pageActuelle = 1;
    const debut = (pageActuelle - 1) * filmsParPage;
    
    afficherFilms(resultats.slice(debut, debut + filmsParPage));
    afficherPagination(totalPages);
}

function afficherFilms(films) {
    dvdList.innerHTML = "";
    films.forEach(dvd => {
        const estDansWatchlist = watchlist.includes(dvd.id);
        const card = document.createElement('div');
        card.className = `dvd-card ${estDansWatchlist ? 'watchlist' : ''}`;
        card.innerHTML = `
            <h3>${dvd.titre || "Sans titre"}</h3>
            <p><strong>Réalisateur :</strong> ${dvd.real || "Inconnu"}</p>
            <p><strong>Année :</strong> ${dvd.annee || "N/C"}</p>
            <p><strong>Rangement :</strong> ${dvd.rangement || "Non classé"}</p>
            <button onclick="toggleWatchlist(${dvd.id})">${estDansWatchlist ? '❌ Retirer' : '⭐ Watchlist'}</button>
        `;
        dvdList.appendChild(card);
    });
}

function toggleWatchlist(id) {
    if (watchlist.includes(id)) watchlist = watchlist.filter(i => i !== id);
    else watchlist.push(id);
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
