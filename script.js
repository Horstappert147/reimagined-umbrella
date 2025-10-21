// Voegt een nieuwe taak toe aan de standaard lijst
function taakToevoegen() {
    const invoerVeld = document.getElementById('taakInvoer');
    const tijdVeld = document.getElementById('tijdInvoer');
    const taakTekst = invoerVeld.value.trim();
    const taakTijd = tijdVeld.value.trim();

    // CONTROLE: Zorg ervoor dat zowel de tekst als de tijd is ingevuld
    if (taakTekst !== "" && taakTijd !== "") {
        const nieuweTaak = {
            tekst: taakTekst,
            tijd: taakTijd
        };
        
        const taken = haalStandaardTakenOp();
        
        // EXTRA CONTROLE: Voorkom duplicaten (optioneel, maar goed)
        const isDuplicaat = taken.some(taak => taak.tekst === taakTekst);
        
        if (isDuplicaat) {
             alert("Deze taak bestaat al in je standaard routine.");
             invoerVeld.value = "";
             return; // Stop de functie hier
        }
        
        // 1. Voeg toe, sorteer en sla op
        taken.push(nieuweTaak);
        // Sorteer de taken op tijd, zodat ze in de juiste volgorde in de timeline staan
        taken.sort((a, b) => a.tijd.localeCompare(b.tijd)); 
        slaStandaardTakenOp(taken);

        // 2. Maak de invoervelden leeg voor de volgende invoer
        invoerVeld.value = "";
        
        // 3. Update de weergave
        toonStandaardTaken(); // Update de beheerlijst
        laadRoutineVoorDatum(); // Update de timeline
        
        // OPTIONEEL: Laat de beheersectie even zien als bevestiging
        document.querySelector('.standaard-beheer-sectie').style.display = 'block';
    } else {
        // BELANGRIJK: Feedback geven als er iets mist
        alert("Vul zowel de taaktekst als de gewenste tijd in om de taak toe te voegen.");
    }
}
