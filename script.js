// Toont de routine voor de geselecteerde dag
function toonRoutine(datumString, takenVoorDieDag) {
    const takenLijst = document.getElementById('takenLijst');
    takenLijst.innerHTML = ''; // Leeg de lijst

    // Haal de sjabloontaken op, zodat we weten welke er moeten zijn
    const standaardTaken = haalStandaardTakenOp();
    
    // Gebruik de standaard taken als basis voor weergave
    standaardTaken.forEach((standaardTaak, index) => {
        const li = document.createElement('li');
        let isAfgevinkt = false;
        
        // Zoek of deze taak in de geschiedenis van die dag staat
        const afgevinkteTaak = takenVoorDieDag.find(t => t.tekst === standaardTaak.tekst);

        if (afgevinkteTaak) {
            isAfgevinkt = true;
            li.classList.add('afgevinkt');
        }

        // Maak de Tijd Stempel
        const tijdSpan = document.createElement('span');
        tijdSpan.classList.add('tijd-stempel');
        tijdSpan.textContent = standaardTaak.tijd || '—:—'; // Toon tijd of streepje

        // Maak de Tekst en Container
        const taakTekstSpan = document.createElement('span');
        taakTekstSpan.classList.add('taak-tekst');
        taakTekstSpan.textContent = standaardTaak.tekst;

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('taak-info');
        infoDiv.appendChild(tijdSpan);
        infoDiv.appendChild(taakTekstSpan);
        
        li.appendChild(infoDiv);


        // Maak de Check Icon
        const checkIcoon = document.createElement('i');
        checkIcoon.classList.add('check-icoon', 'fas', 'fa-check-circle');
        li.appendChild(checkIcoon);
        
        // Voeg klik-luisteraar toe om de status te wisselen
        li.addEventListener('click', function() {
            wisselTaakStatus(standaardTaak.tekst, !isAfgevinkt);
        });

        takenLijst.appendChild(li);
    });
}

// Pas ook de functie voor het tonen van standaard taken aan (Verwijderknop icoon)
function toonStandaardTaken() {
    const sectie = document.querySelector('.standaard-beheer-sectie');
    const beheerKnop = document.getElementById('toonToevoegenKnop');
    const isZichtbaar = sectie.style.display === 'block';

    if (isZichtbaar) {
         // ... (De rest van de code die de lijst vult, niet veranderd)
    }
    
    // De rest van de code:
    const lijst = document.getElementById('opgeslagenTakenLijst');
    lijst.innerHTML = '';
    
    const taken = haalStandaardTakenOp();
    
    taken.forEach((taak, index) => {
        const li = document.createElement('li');
        li.textContent = taak.tekst + ` om ${taak.tijd}`;
        
        // Maak de verwijderknop met icoon
        const verwijderKnop = document.createElement('i');
        verwijderKnop.classList.add('verwijder-knop-klein', 'fas', 'fa-times-circle');
        
        // Klik om te verwijderen
        verwijderKnop.addEventListener('click', function(e) {
            e.stopPropagation(); // Voorkomt dat de LI-klik ook afgaat (hoewel die nu niet meer bestaat)
            verwijderStandaardTaak(index);
        });
        
        li.appendChild(verwijderKnop);
        lijst.appendChild(li);
    });
}

// ... (Rest van de script.js code blijft onveranderd)
