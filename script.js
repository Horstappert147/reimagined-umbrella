document.addEventListener('DOMContentLoaded', function() {
    // Zorgt ervoor dat de taken meteen geladen worden als de pagina opent
    laadTaken();
});

// Functie om de taak uit het invoerveld toe te voegen
function taakToevoegen() {
    const invoerVeld = document.getElementById('taakInvoer');
    const taakTekst = invoerVeld.value.trim();

    if (taakTekst !== "") {
        // Een nieuwe taak is altijd in de 'niet afgevinkt' staat
        const nieuweTaak = {
            tekst: taakTekst,
            afgevinkt: false
        };
        
        // Haal de huidige taken op, voeg de nieuwe toe en sla op
        const taken = haalTakenOp();
        taken.push(nieuweTaak);
        slaTakenOp(taken);

        // Werk de lijst op de pagina bij
        toonTaken(taken);

        // Maak het invoerveld leeg
        invoerVeld.value = "";
    }
}

// Functie om de taken uit de lokale opslag (localStorage) te halen
function haalTakenOp() {
    const takenJSON = localStorage.getItem('ochtendRoutineTaken');
    // Als er taken zijn, parseer ze. Anders, geef een lege array terug.
    return takenJSON ? JSON.parse(takenJSON) : [];
}

// Functie om de taken in de lokale opslag (localStorage) op te slaan
function slaTakenOp(taken) {
    // Sla de array met taken op als een JSON string
    localStorage.setItem('ochtendRoutineTaken', JSON.stringify(taken));
}

// Functie om de volledige lijst van taken op het scherm te tonen
function toonTaken(taken) {
    const takenLijst = document.getElementById('takenLijst');
    takenLijst.innerHTML = ''; // Maak de lijst eerst leeg

    taken.forEach((taak, index) => {
        // Maak een nieuw LI (list item) element
        const li = document.createElement('li');
        li.textContent = taak.tekst;
        
        // Voeg de CSS klasse 'afgevinkt' toe als de taak afgevinkt is
        if (taak.afgevinkt) {
            li.classList.add('afgevinkt');
        }

        // Voeg een klik-luisteraar toe om de taak te wisselen (afvinken/terugzetten)
        li.addEventListener('click', function() {
            wisselTaakStatus(index);
        });

        // Maak de verwijderknop
        const verwijderKnop = document.createElement('button');
        verwijderKnop.textContent = '×';
        verwijderKnop.classList.add('verwijder-knop');
        
        // Zorg ervoor dat klikken op de verwijderknop de taak verwijdert,
        // maar de 'click' op de LI (wisselTaakStatus) negeert.
        verwijderKnop.addEventListener('click', function(event) {
            event.stopPropagation(); // Voorkom dat LI-klik ook afgaat
            verwijderTaak(index);
        });

        li.appendChild(verwijderKnop);
        takenLijst.appendChild(li);
    });
}

// Functie om de status van een taak te veranderen (afgevinkt <-> niet afgevinkt)
function wisselTaakStatus(index) {
    const taken = haalTakenOp();
    // Verander de status naar het tegenovergestelde
    taken[index].afgevinkt = !taken[index].afgevinkt;
    
    slaTakenOp(taken);
    toonTaken(taken); // Lijst opnieuw tonen
}

// Functie om een taak te verwijderen
function verwijderTaak(index) {
    const taken = haalTakenOp();
    // Verwijder 1 element op de gegeven index
    taken.splice(index, 1);
    
    slaTakenOp(taken);
    toonTaken(taken); // Lijst opnieuw tonen
}

// Functie die wordt aangeroepen bij het laden van de pagina
function laadTaken() {
    const taken = haalTakenOp();
    toonTaken(taken);
}
