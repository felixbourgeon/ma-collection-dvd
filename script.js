const dvdList = document.getElementById('dvdList');
const searchInput = document.getElementById('searchInput');
const watchlistFilter = document.getElementById('watchlistFilter');
const vuFilter = document.getElementById('vuFilter'); // Sélectionne le nouveau menu déroulant
const sortSelect = document.getElementById('sortSelect');
const paginationContainer = document.getElementById('pagination');

let mesDVDs = [];
let watchlist = JSON.parse(localStorage.getItem('maWatchlist')) || [];
let filmsVus = JSON.parse(localStorage.getItem('mesFilmsVus')) || [];
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
        dvdList.innerHTML = "Erreur de chargement des films.";
    });

function majAffichage() {
    const recherche = searchInput.value.toLowerCase();
    
    // 1. Filtrage
    let resultats = mesDVDs.filter(dvd => {
        const matchTexte = (dvd.titre + (dvd.real || "") + (dvd.annee || "") + (dvd.rangement || "")).toLowerCase().includes(recherche);
        const matchWatchlist = watchlistFilter.checked ? watchlist.includes(dvd.id) : true;
        
        // Nouvelle logique à 3 états pour le filtre de visionnage
        let matchVu = true;
        if (vuFilter.value === 'vus') {
            matchVu = filmsVus.includes(dvd.id);
        } else if (vuFilter.value === 'non-vus') {
            matchVu = !filmsVus.includes(dvd.id);
        }
        
        return matchTexte && matchWatchlist && matchVu;
    });

    // 2. Tri
    const tri = sortSelect.value;
    resultats.sort((a, b) => {
        let valA, valB;
        if (tri.startsWith('titre')) { valA = a.titre; valB = b.titre; }
        else if (tri.startsWith('real')) { valA = a.real || ""; valB = b.real || ""; }
        else if (tri.startsWith('annee')) { valA = a.annee; valB = b.annee; }
        else { valA = a.rangement; valB = b.rangement; }

        if (tri.endsWith('asc')) return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
    });

    // 3. Calcul Pagination
    const totalPages = Math.ceil(resultats.length / filmsParPage);
    const debut = (pageActuelle - 1) * filmsParPage;
    const selection = resultats.slice(debut, debut + filmsParPage);

    // Mise à jour de l'interface
    document.getElementById('movieCount').innerText = resultats.length;
    majProgressions(mesDVDs.length, watchlist.length);
    afficherDVDs(selection);
    afficherPagination(totalPages);
}

function majProgressions(totalFilms, totalWatchlist) {
    const vusDansWatchlist = watchlist.filter(id => filmsVus.includes(id)).length;
    
    const pctTotal = totalFilms > 0 ? ((filmsVus.length / totalFilms) * 100).toFixed(1) : 0;
    const pctWatchlist = totalWatchlist > 0 ? ((vusDansWatchlist / totalWatchlist) * 100).toFixed(1) : 0;

    document.getElementById('barreTotal').style.width = pctTotal + "%";
    document.getElementById('texteTotal').innerText = `Collection : ${pctTotal}% vus (${filmsVus.length}/${totalFilms})`;

    document.getElementById('barreWatchlist').style.width = pctWatchlist + "%";
    document.getElementById('texteWatchlist').innerText = `Watchlist : ${pctWatchlist}% vus (${vusDansWatchlist}/${totalWatchlist})`;
}

function afficherDVDs(liste) {
    dvdList.innerHTML = "";
    liste.forEach(dvd => {
        const estDansWatchlist = watchlist.includes(dvd.id);
        const estVu = filmsVus.includes(dvd.id);
        const card = document.createElement('div');
        card.className = `dvd-card ${estDansWatchlist ? 'watchlist' : ''} ${estVu ? 'vu' : ''}`;
        card.innerHTML = `
            <h3>${dvd.titre || "Sans titre"}</h3>
            <p><strong>Réalisateur :</strong> ${dvd.real || "Inconnu"}</p>
            <p><strong>Année :</strong> ${dvd.annee || "N/C"}</p>
            <p><strong>Rangement :</strong> ${dvd.rangement || "Non classé"}</p>
            <div class="card-buttons">
                <button onclick="toggleWatchlist(${dvd.id})">${estDansWatchlist ? '❌ Watchlist' : '⭐ Watchlist'}</button>
                <button class="btn-vu" onclick="toggleVu(${dvd.id})">${estVu ? '✅ Vu' : '👁️ Vu'}</button>
            </div>
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

function toggleVu(id) {
    if (filmsVus.includes(id)) filmsVus = filmsVus.filter(i => i !== id);
    else filmsVus.push(id);
    localStorage.setItem('mesFilmsVus', JSON.stringify(filmsVus));
    majAffichage();
}

function afficherPagination(total) {
    paginationContainer.innerHTML = "";
    if (total <= 1) return;

    const delta = 1;
    const range = [];

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= pageActuelle - delta && i <= pageActuelle + delta)) {
            range.push(i);
        }
    }

    let l;
    range.forEach(i => {
        if (l) {
            if (i - l !== 1) {
                const dot = document.createElement('span');
                dot.innerText = "...";
                paginationContainer.appendChild(dot);
            }
        }
        creerBoutonPage(i);
        l = i;
    });
}

function creerBoutonPage(i) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = `page-btn ${i === pageActuelle ? 'active' : ''}`;
    btn.onclick = () => { 
        pageActuelle = i; 
        majAffichage(); 
        window.scrollTo(0,0); 
    };
    paginationContainer.appendChild(btn);
}

// Écouteurs d'événements
searchInput.addEventListener('input', () => { pageActuelle = 1; majAffichage(); });
watchlistFilter.addEventListener('change', () => { pageActuelle = 1; majAffichage(); });
vuFilter.addEventListener('change', () => { pageActuelle = 1; majAffichage(); }); // Écoute le changement du menu déroulant
sortSelect.addEventListener('change', () => { majAffichage(); });
