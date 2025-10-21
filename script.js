// Globale variabele voor de momenteel geselecteerde datum
let huidigeDatum = new Date();

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialiseer datumkiezer op vandaag
    initialiseerDatumKiezer();
    // 2. Laad de routine voor vandaag (nu de timeline)
    laadRoutineVoorDatum();
    // 3. Toon de streak bij het laden
    berekenEnToonStreak();
    // 4. Toon de standaard taken voor beheer
    toonStandaardTaken();

    // Event listener voor de foto-uploader (wordt geactiveerd na klik op de taak)
    document.getElementById('fotoUploader').addEventListener('change', handleFotoUpload);
});

// Hulppfuncties voor datumbeheer
const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // Formaat YYYY-MM-DD
};

const parseDate = (dateString) => {
    return new Date(dateString + 'T00:00:00'); 
};

// Functie om uren en minuten naar een 24-uurs tijdstring te converteren (bv. "08:30")
const formatTime = (h, m) => {
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
};

// ----------------------------------------------------
// Deel A: Taken en Opslag
// ----------------------------------------------------

// Haalt de vaste, standaard taken op (het sjabloon)
function haalStandaardTakenOp() {
    const takenJSON = localStorage.getItem('standaardRoutineTaken');
    return takenJSON ? JSON.parse(takenJSON) : [
        {tekst: "Opstaan", tijd: "08:00"},
        {tekst: "10 min. mediteren", tijd: "08:15"},
        {tekst: "Gezond ontbijten", tijd: "08:45"}
    ]; 
}

function slaStandaardTakenOp(taken) {
    localStorage.setItem('standaardRoutineTaken', JSON.stringify(taken));
}

// Haalt de geschiedenis van alle routines op (voor alle dagen)
function haalGeschiedenisOp() {
    const geschiedenisJSON = localStorage.getItem('dagelijkseRoutineGeschiedenis');
    return geschiedenisJSON ? JSON.parse(geschiedenisJSON) : {};
}

function slaGeschiedenisOp(geschiedenis) {
    localStorage.setItem('dagelijkseRoutineGeschiedenis', JSON.stringify(geschiedenis));
}

// ----------------------------------------------------
// Deel B: Timeline & Interactiviteit
// ----------------------------------------------------

function toonTimeline(datumString, takenVoorDieDag) {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = ''; 

    // Alle kwartieren van 06:00 tot 12:00 (Ochtendroutine)
    for (let h = 6; h < 12; h++) {
        for (let m = 0; m < 60; m += 15) {
            const currentTime = formatTime(h, m);

            // Zoek of er een standaard taak is die op dit kwartier begint
            const taak = haalStandaardTakenOp().find(t => t.tijd === currentTime);
            
            const item = document.createElement('div');
            item.classList.add('timeline-item');
            
            // Tijdstempel
            const timeSpan = document.createElement('span');
            timeSpan.classList.add('timeline-item-time');
            timeSpan.textContent = currentTime;
            item.appendChild(timeSpan);
            
            if (taak) {
                // Dit is een taak-item
                item.classList.add('activity');
                
                let isAfgevinkt = false;
                let fotoData = null;
                
                // Zoek in de dagelijkse geschiedenis
                const afgevinkteTaak = takenVoorDieDag.find(t => t.tekst === taak.tekst);

                if (afgevinkteTaak) {
                    isAfgevinkt = true;
                    item.classList.add('afgevinkt');
                    fotoData = afgevinkteTaak.foto;
                }
                
                // Inhoud van de taak
                const contentDiv = document.createElement('div');
                contentDiv.classList.add('timeline-item-content');
                contentDiv.innerHTML = `<span>${taak.tekst}</span>`;

                // Check icoon (klikbare status)
                const checkIcoon = document.createElement('i');
                checkIcoon.classList.add('check-icoon', 'fas', isAfgevinkt ? 'fa-check-circle' : 'fa-circle');
                contentDiv.appendChild(checkIcoon);

                item.appendChild(contentDiv);
                
                // Foto Weergave
                if (fotoData) {
                    const fotoImg = document.createElement('img');
                    fotoImg.classList.add('taak-foto');
                    fotoImg.src = fotoData;
                    item.appendChild(fotoImg);
                }
                
                // Klik functionaliteit: Status wisselen & Foto-upload
                item.addEventListener('click', function() {
                    if (isAfgevinkt) {
                        // Afgevinkt: Vraag om foto toe te voegen of status terug te zetten
                        wisselTaakStatus(taak.tekst, false); // Terugzetten
                    } else {
                        // Niet afgevinkt: Vink af en vraag om foto
                        wisselTaakStatus(taak.tekst, true);
                        vraagOmFotoUpload(taak.tekst, datumString);
                    }
                });

            } else {
                 // Dit is een leeg kwartier: toon alleen de tijd
                 item.style.minHeight = '10px'; 
                 item.style.borderLeft = 'none';
                 item.style.padding = '10px 0';
            }
            
            container.appendChild(item);
        }
    }
}

// Roept de routine voor de geselecteerde datum op en toont deze
function laadRoutineVoorDatum() {
    const datumString = formatDate(huidigeDatum);
    
    // UI datumweergave updaten
    document.getElementById('datumKiezer').value = datumString;
    // Weergave op de pagina
    // Dit element bestaat niet meer in de nieuwe HTML, dus we verwijderen de lijn:
    // document.getElementById('huidigeDatumWeergave').textContent = datumString;
    
    const geschiedenis = haalGeschiedenisOp();
    const takenVoorDieDag = geschiedenis[datumString] || []; 
    
    toonTimeline(datumString, takenVoorDieDag);
}

// Wisselt de status van een taak voor de huidige datum (en wist foto als teruggezet)
function wisselTaakStatus(taakTekst, wilAfvinken) {
    const datumString = formatDate(huidigeDatum);
    const geschiedenis = haalGeschiedenisOp();
    const takenVoorDieDag = geschiedenis[datumString] || [];
    
    const index = takenVoorDieDag.findIndex(t => t.tekst === taakTekst);
    
    if (wilAfvinken) {
        if (index === -1) { 
            // Vink af, zonder foto (die komt later)
            takenVoorDieDag.push({
                tekst: taakTekst, 
                afvinkTijd: new Date().toLocaleTimeString('nl-NL'),
                foto: null // Foto wordt later toegevoegd
            });
        }
    } else {
        if (index !== -1) { 
            // Zet terug (verwijder taak)
            takenVoorDieDag.splice(index, 1);
        }
    }
    
    geschiedenis[datumString] = takenVoorDieDag;
    slaGeschiedenisOp(geschiedenis);
    
    laadRoutineVoorDatum(); 
    berekenEnToonStreak(); 
}

// ----------------------------------------------------
// Deel C: Foto Upload (Base64)
// ----------------------------------------------------

// Temporaire variabele om te onthouden welke taak en datum de foto krijgt
let tempTaak = null;
let tempDatumString = null;

function vraagOmFotoUpload(taakTekst, datumString) {
    tempTaak = taakTekst;
    tempDatumString = datumString;
    
    // Vraag aan de gebruiker of ze een foto willen toevoegen
    if (confirm(`Taak '${taakTekst}' is afgevinkt. Wil je een foto toevoegen? (Optioneel)`)) {
        // Activeer de verborgen file-input
        document.getElementById('fotoUploader').click();
    }
}

function handleFotoUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    // Lees het bestand als een Base64 Data URL
    const reader = new FileReader();
    reader.onload = function(e) {
        const fotoData = e.target.result;
        
        // Sla de Base64 data op bij de correcte taak in de geschiedenis
        voegFotoAanTaakToe(tempTaak, tempDatumString, fotoData);

        // Reset de tijdelijke variabelen
        tempTaak = null;
        tempDatumString = null;
        event.target.value = null; // Maak de input leeg zodat 'change' opnieuw werkt
    };
    
    // Lees het bestand als Base64
    reader.readAsDataURL(file);
}

function voegFotoAanTaakToe(taakTekst, datumString, fotoData) {
    const geschiedenis = haalGeschiedenisOp();
    const takenVoorDieDag = geschiedenis[datumString] || [];
    
    const index = takenVoorDieDag.findIndex(t => t.tekst === taakTekst);

    if (index !== -1) {
        // Voeg de Base64 string toe aan de opgeslagen taak
        takenVoorDieDag[index].foto = fotoData;
        geschiedenis[datumString] = takenVoorDieDag;
        slaGeschiedenisOp(geschiedenis);
        
        laadRoutineVoorDatum(); // Herlaad om de foto te tonen
    }
}


// ----------------------------------------------------
// Deel D: Standaard Taken & Datum Navigatie (Kleine aanpassingen)
// ----------------------------------------------------

// Beheert het tonen/verbergen van de beheersectie
function toonStandaardBeheer() {
    const sectie = document.querySelector('.standaard-beheer-sectie');
    const knop = document.getElementById('toonBeheerKnop');
    
    if (sectie.style.display === 'none' || sectie.style.display === '') {
        sectie.style.display = 'block';
        knop.innerHTML = '<i class="fas fa-eye-slash"></i> Verberg Standaard Routine';
    } else {
        sectie.style.display = 'none';
        knop.innerHTML = '<i class="fas fa-cogs"></i> Beheer Standaard Routine';
    }
}


// Beheert het veranderen van de datum via knoppen
function changeDate(days) {
    huidigeDatum.setDate(huidigeDatum.getDate() + days);
    laadRoutineVoorDatum();
    berekenEnToonStreak(); 
}

// Initialiseert de datumkiezer op vandaag
function initialiseerDatumKiezer() {
    const vandaag = new Date();
    huidigeDatum = parseDate(formatDate(vandaag)); 
    document.getElementById('datumKiezer').value = formatDate(huidigeDatum);
}


// Toont de lijst met taken die als sjabloon dienen (met verwijderknop)
function toonStandaardTaken() {
    const lijst = document.getElementById('opgeslagenTakenLijst');
    lijst.innerHTML = '';
    
    const taken = haalStandaardTakenOp();
    
    taken.forEach((taak, index) => {
        const li = document.createElement('li');
        li.textContent = `${taak.tekst} om ${taak.tijd}`;
        
        // Maak de verwijderknop met icoon
        const verwijderKnop = document.createElement('i');
        verwijderKnop.classList.add('verwijder-knop-klein', 'fas', 'fa-times-circle');
        
        verwijderKnop.addEventListener('click', function(e) {
            e.stopPropagation(); 
            verwijderStandaardTaak(index);
        });
        
        li.appendChild(verwijderKnop);
        lijst.appendChild(li);
    });
}

function verwijderStandaardTaak(index) {
    if (confirm("Weet je zeker dat je deze taak uit je vaste routine wilt verwijderen?")) {
        const taken = haalStandaardTakenOp();
        taken.splice(index, 1);
        slaStandaardTakenOp(taken);
        toonStandaardTaken(); 
        laadRoutineVoorDatum(); 
    }
}

// Voegt een nieuwe taak toe aan de standaard lijst
function taakToevoegen() {
    const invoerVeld = document.getElementById('taakInvoer');
    const tijdVeld = document.getElementById('tijdInvoer');
    const taakTekst = invoerVeld.value.trim();
    const taakTijd = tijdVeld.value.trim();

    if (taakTekst !== "" && taakTijd !== "") {
        const nieuweTaak = {
            tekst: taakTekst,
            tijd: taakTijd
        };
        
        const taken = haalStandaardTakenOp();
        taken.push(nieuweTaak);
        slaStandaardTakenOp(taken);

        invoerVeld.value = "";
        
        toonStandaardTaken();
        laadRoutineVoorDatum(); 
        
        // Geef visuele feedback dat de taak nu in de timeline staat
        document.querySelector('.standaard-beheer-sectie').style.display = 'block';
    } else {
        alert("Voer zowel de taaktekst als de tijd in.");
    }
}


// Functie voor Streak Berekening (Blijft ongewijzigd)
function berekenEnToonStreak() {
    const geschiedenis = haalGeschiedenisOp();
    const standaardTaken = haalStandaardTakenOp();
    const benodigdeTakenCount = standaardTaken.length;
    let streak = 0;
    
    let currentDate = parseDate(formatDate(new Date())); 
    
    while (true) {
        const datumString = formatDate(currentDate);
        const takenOpDieDag = geschiedenis[datumString] || [];
        
        if (!geschiedenis.hasOwnProperty(datumString) && formatDate(currentDate) !== formatDate(new Date())) {
            break;
        }
        
        if (takenOpDieDag.length >= benodigdeTakenCount && benodigdeTakenCount > 0) {
            streak++;
        } else {
            if (formatDate(currentDate) !== formatDate(new Date())) {
                break;
            }
        }

        currentDate.setDate(currentDate.getDate() - 1);
        if (streak > 365) break; 
    }
    
    document.getElementById('streakTeller').textContent = streak;
}
