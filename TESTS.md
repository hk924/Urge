# Urge — User Stories / Testscenarier

## Auth

- Som bruker skriver jeg inn navn og e-post og trykker "Send kode", og forventer at OTP-kode sendes til e-posten min og at jeg ser OTP-feltet.
- Som bruker lar jeg navn eller e-post stå tomt, og forventer at "Send kode"-knappen er deaktivert.
- Som bruker skriver jeg inn 6-sifret OTP og trykker "Bekreft", og forventer å bli logget inn og sendt til onboarding (første gang) eller hjem.
- Som bruker skriver jeg inn feil OTP, og forventer feilmelding "Feil kode. Prøv igjen." og at jeg kan prøve på nytt.
- Som bruker trykker jeg "Tilbake" fra OTP-steget, og forventer å komme tilbake til e-post/navn-feltet med OTP-kode nullstilt.
- Som bruker trykker jeg "Send kode på nytt", og forventer at ny kode sendes til e-posten.
- Som bruker skriver jeg bokstaver i OTP-feltet, og forventer at bare siffer aksepteres.
- Som bruker venter jeg i mer enn 8 sekunder på lasting, og forventer at loading-skjermen forsvinner (timeout).

## Onboarding

- Som ny bruker velger jeg minst ett mål og trykker "Neste", og forventer å komme til "Hvorfor"-steget.
- Som ny bruker prøver jeg å trykke "Neste" uten å velge mål eller skrive egendefinert mål, og forventer at knappen er deaktivert.
- Som ny bruker skriver jeg et egendefinert mål uten å velge ferdigdefinerte, og forventer at "Neste" aktiveres.
- Som ny bruker velger jeg minst én "hvorfor" og trykker "Start reisen", og forventer at profilen lagres og at jeg kommer til hjem-skjermen.
- Som ny bruker prøver jeg å trykke "Start reisen" uten å velge "hvorfor", og forventer at knappen er deaktivert.
- Som ny bruker trykker jeg "Tilbake" fra "Hvorfor"-steget, og forventer å komme tilbake til målvalg med valgene mine bevart.

## Hjem

- Som bruker åpner jeg appen, og forventer å se dagens dato, personlig hilsen, motivasjonssitat, streak, spart beløp og kveldssjekk.
- Som bruker trykker jeg "Nytt" ved sitatet, og forventer et nytt motivasjonssitat (ikke det samme som forrige).
- Som bruker ser jeg streak-kortet, og forventer at det viser nåværende streak i dager og beste streak.
- Som bruker ser jeg spart-kortet, og forventer at beløpet er antall resists × kostnad per smell, med fremdriftslinje mot neste milepæl.
- Som bruker trykker jeg "Jeg motstod en fristelse", og forventer å komme til resist-flyten.
- Som bruker trykker jeg "Jeg gikk på en smell", og forventer å se en støttemelding og valget om å skrive memo.

### Kveldssjekk

- Som bruker velger jeg en stemning (f.eks. "En god minusdag"), og forventer at sjekken lagres for valgt dato og at stemningen vises som bekreftet.
- Som bruker har allerede sjekket inn i dag og ser "Sees i morgen" med en "Angre"-lenke, og forventer at "Angre" sletter sjekken slik at jeg kan sjekke inn på nytt.
- Som bruker trykker jeg på datodropdown og velger "I går", og forventer at kveldssjekken endres til gårsdagens dato.
- Som bruker velger jeg en dato 5 dager tilbake og sjekker inn, og forventer at sjekken lagres med riktig dato.
- Som bruker ser jeg "Siste dager"-listen, og forventer å se de siste 5 innsjekkene med dato og stemning.

## Resist-flyt

- Som bruker velger jeg en trigger-type og trykker "Registrer", og forventer at resisten lagres og at jeg ser belønningsskjermen.
- Som bruker prøver jeg å trykke "Registrer" uten å velge trigger, og forventer at knappen er deaktivert.
- Som bruker skriver en valgfri situasjonsnotat og lagrer, og forventer at notatet vises i loggen etterpå.
- Som bruker endrer dato til "I går" i datovelgeren og registrerer, og forventer at resisten lagres med gårsdagens dato.
- Som bruker ser belønningsskjermen, og forventer å se oppdatert streak, spart beløp, og et motivasjonssitat.
- Som bruker ser belønningsskjermen, og forventer at konfetti vises ca. 30 % av gangene.
- Som bruker trykker "Tilbake" fra belønningsskjermen, og forventer å komme tilbake til hjem-skjermen.
- Som bruker trykker "Lukk" under trigger-valg, og forventer å komme tilbake til hjem uten at noe lagres.

## Smell-flyt

- Som bruker ser støttemeldingen og trykker "Hopp over", og forventer at en tom smell lagres for valgt dato og at jeg kommer tilbake til hjem.
- Som bruker trykker "Ja, skriv memo", og forventer å se memo-skjemaet med trigger, følelse, hva og kostnad-felt.
- Som bruker fyller ut memo-feltene og trykker "Lagre memo", og forventer at smellen lagres med alle detaljer og at jeg kommer tilbake til hjem.
- Som bruker fyller ut bare kostnad og lar resten stå tomt, og forventer at lagring fungerer med tomme tekstfelt og riktig kostnad.
- Som bruker endrer dato til 3 dager siden i datovelgeren og lagrer, og forventer at smellen lagres med riktig dato.
- Som bruker trykker "Lukk" i memo-skjemaet, og forventer å komme tilbake til hjem uten at noe lagres.
- Som bruker har 0 resists og ser støttemeldingen, og forventer teksten "Alle starter et sted." i stedet for statistikk.
- Som bruker har resists og ser støttemeldingen, og forventer tekst som inkluderer antall resists og spart beløp.

## Logg

- Som bruker åpner loggen uten data, og forventer å se "Ingen logg enda!".
- Som bruker åpner loggen med data, og forventer å se oppsummeringskort med totalt motstått og smell, og en kronologisk liste sortert nyest først.
- Som bruker ser logglisten, og forventer at resists har lilla venstrekant og hake-ikon, og smells har rosa venstrekant og pil-ikon.
- Som bruker trykker på en resist i listen, og forventer å se detaljvisning med dato, trigger-type med ikon, og eventuelt notat.
- Som bruker trykker på en smell i listen, og forventer å se detaljvisning med dato, trigger, følelse, hva og kostnad (kun felt som er utfylt).
- Som bruker ser smell-detalj med "hva"-felt, og forventer refleksjonsteksten "Var det verdt det? Husk denne følelsen neste gang."

### Slett i logg

- Som bruker trykker "Slett" på en resist-detalj, og forventer at knappen endres til "Bekreft sletting" (rød).
- Som bruker trykker "Bekreft sletting" på resisten, og forventer at den slettes og at jeg kommer tilbake til logglisten.
- Som bruker trykker "Slett" på en smell-detalj, og forventer samme to-trinns bekreftelse som for resist.
- Som bruker trykker "Bekreft sletting" på smellen, og forventer at den slettes og at logglisten oppdateres.
- Som bruker trykker "Slett" og deretter "Lukk" (uten å bekrefte), og forventer at ingenting slettes.

## Statistikk

- Som bruker åpner statistikk-skjermen, og forventer å se streak-badge, ukeoversikt, 4-kortet (streak, beste, motstått, smell), spart beløp, milepæler og trigger-fordeling.
- Som bruker har streak på 0, og forventer å se "Ny start"-melding i stedet for nivå.
- Som bruker har streak ≥7, og forventer å se "Nivå 2" i streak-badge.
- Som bruker ser ukeoversikten, og forventer grønn prikk for dager med resist/sjekk, rosa prikk for dager med bare smell, og stiplet kant for fremtidige dager.
- Som bruker ser milepæl-listen, og forventer hake på nådde milepæler, fremdriftslinje på aktiv milepæl, og låst utseende på kommende.
- Som bruker ser trigger-fordelingen, og forventer triggere sortert etter antall resists (mest først) med tall for resists og smells per trigger.
- Som bruker ser spart beløp, og forventer å se total spart og formelen (antall resists × kostnad).

## Kropp — Vekt

- Som bruker åpner vekt-fanen uten data, og forventer å se "Ingen vekt logget".
- Som bruker trykker "+ Logg" og skriver inn vekt, og forventer at vekten lagres og vises med graf.
- Som bruker logger vekt med datovelger satt til "I går", og forventer at vekten lagres med gårsdagens dato.
- Som bruker har flere vektmålinger, og forventer å se nåværende vekt, endring fra første måling (grønn pil ned), graf, og historikkliste.
- Som bruker logger vekt for en dato som allerede har en vekt, og forventer at den gamle verdien erstattes.
- Som bruker prøver å lagre uten å fylle inn vekt, og forventer at ingenting skjer (knappen gjør ingenting).

### Slett vekt

- Som bruker ser historikklisten og trykker "✕" på et vektpunkt, og forventer at knappen endres til "Bekreft?".
- Som bruker trykker "Bekreft?" på vektpunktet, og forventer at det slettes fra liste og graf.
- Som bruker trykker "✕" og deretter trykker et annet sted, og forventer at bekreftelsestilstanden nullstilles.

## Kropp — Sammensetning

- Som bruker åpner sammensetning-fanen uten fett/muskeldata, og forventer meldingen "Logg vekt med fett/muskelmasse for grafer".
- Som bruker logger vekt med fettprosent og muskelmasse, og forventer å se to separate grafer (fettprosent i blått, muskelmasse i rosa).
- Som bruker logger vekt med bare fettprosent (uten muskelmasse), og forventer å bare se fettprosent-grafen.
- Som bruker logger sammensetning med datovelger, og forventer at riktig dato brukes.

## Kropp — Trening

- Som bruker åpner treningsfanen uten data, og forventer å se "Ingen trening logget".
- Som bruker trykker "+ Logg", velger treningstype og varighet, og forventer at treningen lagres og vises i listen.
- Som bruker logger trening med datovelger satt til 2 dager siden, og forventer at treningen lagres med riktig dato.
- Som bruker prøver å lagre trening uten type eller varighet, og forventer at ingenting skjer.
- Som bruker ser treningslisten, og forventer å se type, dato (relativ for i dag) og varighet.

### Slett trening

- Som bruker trykker "✕" på en trening, og forventer at knappen endres til "Bekreft?".
- Som bruker trykker "Bekreft?" på treningen, og forventer at den slettes fra listen.

## Innstillinger

### Mål

- Som bruker åpner innstillinger og endrer mål, og forventer at nye mål lagres og reflekteres i sitater og badges.
- Som bruker fjerner alle mål og legger til et egendefinert, og forventer at det lagres med "custom:"-prefiks.
- Som bruker endrer "hvorfor"-valg, og forventer at nye valg lagres og brukes i motivasjonssitater.

### Triggere

- Som bruker legger til en ny trigger med navn, og forventer at den dukker opp i listen og i resist-flyten.
- Som bruker sletter en trigger med "✕"-knappen, og forventer at den fjernes fra listen.
- Som bruker lagrer triggere, og forventer at endringene bevares etter at innstillinger lukkes.

### Milepæler

- Som bruker legger til ny milepæl med beløp og beskrivelse, og forventer at den sorteres inn etter beløp i listen.
- Som bruker sletter en milepæl, og forventer at den fjernes fra listen og statistikk.
- Som bruker prøver å legge til milepæl uten å fylle ut begge felt, og forventer at ingenting skjer.

### Annet

- Som bruker endrer kostnad per smell, og forventer at spart beløp på hjem og statistikk oppdateres tilsvarende.
- Som bruker ser profil-seksjonen, og forventer å se navn og e-post (skrivebeskyttet).
- Som bruker trykker "Logg ut", og forventer å bli logget ut og sendt tilbake til auth-skjermen med all data nullstilt.

## Generelt / PWA

- Som bruker åpner appen på mobil, og forventer at den er responsiv med maks bredde 430px og sentrert.
- Som bruker ser en feilmelding (toast), og forventer at den forsvinner automatisk etter noen sekunder.
- Som bruker navigerer mellom faner (Hjem, Statistikk, Logg, Kropp), og forventer at aktiv fane er markert og at innholdet endres.
- Som bruker installerer appen som PWA, og forventer at den fungerer som en standalone app med riktig ikon og navn.
