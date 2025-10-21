// Globale variabele voor de momenteel geselecteerde datum
let huidigeDatum = new Date();

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialiseer datumkiezer op vandaag
    initialiseerDatumKiezer();
    // 2. Laad de routine voor vandaag
    laadRoutineVoorDatum();
    // 3. Toon de streak bij het laden
    berekenEnToonStreak();
    // 4. Toon de standaard taken voor beheer
    toonStandaardTaken();
});

// Hulppfuncties voor datumbeheer
const formatDate = (date) => {
    // Formaat YYYY-MM-DD
    return date.toISOString().split('T')[0];
};

const parseDate = (dateString) => {
    // Creëert een datum object van YYYY-MM-DD
    return new Date(dateString + 'T00:00:00'); 
};


// ----------------------------------------------------
// Deel A: Taken en Opslag
// ----------------------------------------------------

// Haalt de vaste, standaard taken op (het sjabloon)
function haalStandaardTakenOp() {
    const takenJSON = localStorage.getItem('standaardRoutineTaken');
    return takenJSON ? JSON.parse(takenJSON) : [
        {tekst: "Opstaan voor 08:00", tijd: "08:00"},
        {tekst: "10 min. mediteren", tijd: "08:15"},
        {tekst: "Gezond ontbijten", tijd: "08:45"}
    ]; // Standaard taken als de opslag leeg is
}

function slaStandaardTakenOp(taken) {
    localStorage.setItem('standaardRoutineTaken', JSON.stringify(taken));
}

// Haalt de geschiedenis van alle routines op (voor alle dagen)
function haalGeschiedenisOp() {
    const geschiedenisJSON = localStorage.getItem('dagelijkseRoutineGeschiedenis');
    return geschiedenisJSON ? JSON.parse(geschiedenisJSON) : {}; // Object met data per datum
}

function slaGeschiedenisOp(geschiedenis) {
    localStorage.setItem('dagelijkseRoutineGeschiedenis', JSON.stringify(geschiedenis));
}

// ----------------------------------------------------
// Deel B: UI en Interactiviteit
// ----------------------------------------------------

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

        const tijdWeergave = standaardTaak.tijd ? ` (${standaardTaak.tijd})` : '';
        li.textContent = standaardTaak.tekst + tijdWeergave;
        
        // Voeg klik-luisteraar toe om de status te wisselen
        li.addEventListener('click', function() {
            wisselTaakStatus(standaardTaak.tekst, !isAfgevinkt);
        });

        takenLijst.appendChild(li);
    });
}

// Roept de routine voor de geselecteerde datum op en toont deze
function laadRoutineVoorDatum() {
    const datumString = formatDate(huidigeDatum);
    
    // UI datumweergave updaten
    document.getElementById('datumKiezer').value = datumString;
    document.getElementById('huidigeDatumWeergave').textContent = datumString;
    
    const geschiedenis = haalGeschiedenisOp();
    // Zoek de afgevinkte taken voor deze specifieke dag, of een lege array
    const takenVoorDieDag = geschiedenis[datumString] || []; 
    
    toonRoutine(datumString, takenVoorDieDag);
}

// Wisselt de status van een taak voor de huidige datum
function wisselTaakStatus(taakTekst, wilAfvinken) {
    const datumString = formatDate(huidigeDatum);
    const geschiedenis = haalGeschiedenisOp();
    const takenVoorDieDag = geschiedenis[datumString] || [];
    
    const index = takenVoorDieDag.findIndex(t => t.tekst === taakTekst);
    
    if (wilAfvinken) {
        if (index === -1) { // Taak moet afgevinkt worden en staat nog niet in de lijst
            takenVoorDieDag.push({
                tekst: taakTekst, 
                afvinkTijd: new Date().toLocaleTimeString('nl-NL')
            });
        }
    } else {
        if (index !== -1) { // Taak moet teruggezet worden en staat wel in de lijst
            takenVoorDieDag.splice(index, 1);
        }
    }
    
    geschiedenis[datumString] = takenVoorDieDag;
    slaGeschiedenisOp(geschiedenis);
    
    laadRoutineVoorDatum(); // Herlaad de UI
    berekenEnToonStreak(); // Herbereken de streak
}

// Beheert het veranderen van de datum via knoppen
function changeDate(days) {
    huidigeDatum.setDate(huidigeDatum.getDate() + days);
    laadRoutineVoorDatum();
}

// Initialiseert de datumkiezer op vandaag
function initialiseerDatumKiezer() {
    const vandaag = new Date();
    // Zorg ervoor dat de tijd op middernacht staat voor consistente vergelijking
    huidigeDatum = parseDate(formatDate(vandaag)); 
    document.getElementById('datumKiezer').value = formatDate(huidigeDatum);
}


// ----------------------------------------------------
// Deel C: Standaard Taken Beheer
// ----------------------------------------------------

function toonStandaardTakenToevoegen() {
    const lijstDiv = document.querySelector('.opgeslagen-taken-titel');
    const lijst = document.getElementById('opgeslagenTakenLijst');
    
    if (lijst.style.display === 'none' || lijst.style.display === '') {
        lijstDiv.textContent = 'Beheer Standaard Taken: (Klik om te verwijderen)';
        lijst.style.display = 'block';
    } else {
        lijstDiv.textContent = '';
        lijst.style.display = 'none';
    }
    document.getElementById('toonToevoegenKnop').textContent = (lijst.style.display === 'none' ? 'Beheer Standaard Taken' : 'Verberg Standaard Taken');
}

// Toont de lijst met taken die als sjabloon dienen
function toonStandaardTaken() {
    const lijst = document.getElementById('opgeslagenTakenLijst');
    lijst.innerHTML = '';
    lijst.style.display = 'none'; // Standaard verborgen
    
    const taken = haalStandaardTakenOp();
    
    taken.forEach((taak, index) => {
        const li = document.createElement('li');
        li.textContent = taak.tekst + ` (${taak.tijd})`;
        li.style.cursor = 'pointer';
        
        // Klik om te verwijderen
        li.addEventListener('click', function() {
            verwijderStandaardTaak(index);
        });
        
        lijst.appendChild(li);
    });
}

function verwijderStandaardTaak(index) {
    if (confirm("Weet je zeker dat je deze taak uit je vaste routine wilt verwijderen?")) {
        const taken = haalStandaardTakenOp();
        taken.splice(index, 1);
        slaStandaardTakenOp(taken);
        toonStandaardTaken(); // Herlaad de lijst
        laadRoutineVoorDatum(); // Herlaad de routine voor vandaag
    }
}

// Voegt een nieuwe taak toe aan de standaard lijst
function taakToevoegen() {
    const invoerVeld = document.getElementById('taakInvoer');
    const tijdVeld = document.getElementById('tijdInvoer');
    const taakTekst = invoerVeld.value.trim();
    const taakTijd = tijdVeld.value.trim();

    if (taakTekst !== "") {
        const nieuweTaak = {
            tekst: taakTekst,
            tijd: taakTijd
        };
        
        const taken = haalStandaardTakenOp();
        taken.push(nieuweTaak);
        slaStandaardTakenOp(taken);

        invoerVeld.value = "";
        
        toonStandaardTaken();
        laadRoutineVoorDatum(); // Update de routine om de nieuwe taak te tonen
    }
}

// ----------------------------------------------------
// Deel D: Streak Berekening
// ----------------------------------------------------

function berekenEnToonStreak() {
    const geschiedenis = haalGeschiedenisOp();
    const standaardTaken = haalStandaardTakenOp();
    const benodigdeTakenCount = standaardTaken.length;
    let streak = 0;
    
    let currentDate = parseDate(formatDate(new Date())); // Vandaag (middernacht)
    
    // Loop terug in de tijd
    while (true) {
        const datumString = formatDate(currentDate);
        const takenOpDieDag = geschiedenis[datumString] || [];
        
        // Als er geen taken in de geschiedenis staan voor deze dag, stop de streak
        if (!geschiedenis.hasOwnProperty(datumString)) {
             // Als de dag niet vandaag is en er is geen geschiedenis, dan is de streak gebroken
             if (formatDate(currentDate) !== formatDate(new Date())) {
                break;
             }
        }
        
        // Controleer of ALLE standaard taken op die dag zijn afgevinkt
        if (takenOpDieDag.length >= benodigdeTakenCount && benodigdeTakenCount > 0) {
            streak++;
        } else {
            // Als de dag niet vandaag is, en niet volledig is afgerond, is de streak gebroken
            if (formatDate(currentDate) !== formatDate(new Date())) {
                break;
            }
        }

        // Ga een dag terug
        currentDate.setDate(currentDate.getDate() - 1);
        
        // Stop als we te ver terug zijn
        if (streak > 365) break; 
    }
    
    document.getElementById('streakTeller').textContent = streak;
}
