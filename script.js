const dvdList = document.getElementById('dvdList');
const searchInput = document.getElementById('searchInput');
let mesDVDs = []; // On crée une liste vide au départ

// 1. On charge les données depuis le fichier JSON
fetch('dvds.json')
    .then(response => response.json())
    .then(data => {
        mesDVDs = data; // On remplit notre liste avec le contenu du JSON
        afficherFilms(mesDVDs); // On affiche tout au début
    })
    .catch(error => console.error("Erreur de chargement :", error));

// 2. La fonction pour afficher les films (elle ne change pas)
function afficherFilms(films) {
    dvdList.innerHTML = "";
    films.forEach(dvd => {
        const card = document.createElement('div');
        card.className = 'dvd-card';
        if(dvd.watchlist) card.classList.add('watchlist');
        card.innerHTML = `
            <h3>${dvd.titre}</h3>
            <p><strong>Réalisateur :</strong> ${dvd.real}</p>
            <p><strong>Année :</strong> ${dvd.annee}</p>
            <p><strong>Rangement :</strong> ${dvd.rangement}</p>
            ${dvd.watchlist ? '<span class="badge">À voir</span>' : ''}
        `;
        dvdList.appendChild(card);
    });
}

// 3. La fonction de recherche (elle ne change pas)
searchInput.addEventListener('input', (e) => {
    const recherche = e.target.value.toLowerCase();
    const filmsFiltres = mesDVDs.filter(dvd => 
        dvd.titre.toLowerCase().includes(recherche) || 
        dvd.real.toLowerCase().includes(recherche)
    );
    afficherFilms(filmsFiltres);
});