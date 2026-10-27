# Architettura

## Scelte

| Cosa | Scelta | Perché |
|---|---|---|
| Tipo di app | Web app da QR (installabile) | Zero download, funziona su ogni telefono, aggiornamenti immediati |
| Interfaccia | React 19 + TypeScript | Diffuso, facile trovare sviluppatori |
| Build | Vite | Veloce, pubblicabile su qualsiasi hosting statico |
| Dati | File JSON validati con zod | Un porto nuovo si aggiunge senza toccare il codice |
| Test | Vitest | Le regole del giro e del rientro sono testate |
| Mappa | Disegnata da noi in SVG, dai dati del porto | Stile illustrato riconoscibile, nessun costo di mappe, funziona anche con poca rete |
| Indicazioni | Link a Google Maps / Apple Maps | Navigazione passo passo senza costi |
| Pubblicazione | GitHub Pages con GitHub Actions | Gratis, test automatici prima di ogni pubblicazione |

## Cartelle

```
src/
  domain/        regole pure, senza interfaccia (testate)
    schema.ts        forma dei dati di porti e luoghi
    planner.ts       crea il giro migliore nel tempo disponibile
    returnStatus.ts  decide se sei in orario o devi rientrare
    geo.ts           distanze e minuti a piedi
    time.ts          orari e durate
    directions.ts    link per Google Maps e Apple Maps
    map.ts           proiezione, zoom, raggruppamento dei luoghi sulla mappa
  data/ports/    un file JSON per porto
  i18n/          testi italiano e inglese
  state/         stato dell'app (orari, interessi, giro avviato)
  screens/       Esplora, Arrivo, Giro, Tappa, Timer
  components/    icone illustrate, mappa (MapView) e piccoli componenti
  theme/         design token (colori, misure) chiaro e scuro
  lib/storage.ts salvataggio locale che non va mai in errore
tests/           test automatici
```

## Come si crea il giro

1. La scadenza è «tutti a bordo» meno i controlli al terminal meno 20 minuti di sicurezza.
2. Partendo dal terminal, sceglie ogni volta il luogo con il miglior rapporto tra interesse e minuti spesi (cammino + visita), purché poi resti il tempo per tornare alla nave.
3. Si ferma quando non entra più niente.

Il percorso a piedi è stimato: distanza in linea d'aria × 1,3, a 75 metri al minuto.

## Come si calcola lo stato del rientro

- **In ritardo**: anche partendo adesso non arrivi prima di «tutti a bordo».
- **Rientra adesso**: il momento di partire è arrivato.
- **Inizia a rientrare**: mancano 45 minuti o meno al momento di partire.
- **In orario**: tutto il resto.

La posizione è quella del GPS se l'utente lo consente, altrimenti l'ultima tappa raggiunta.

## Come funziona la mappa

- Le coordinate diventano metri su un piano (proiezione equirettangolare centrata sul terminal): su pochi km l'errore è sotto l'1%.
- Il disegno (mare, isole, parchi, piazze, vie) sta nel file del porto, sotto `map`. Alberi e onde sono generati in automatico.
- Le icone dei luoghi sono veri pulsanti sopra la mappa: si raggiungono anche da tastiera e con il lettore di schermo.
- Quando due luoghi si sovrapporrebbero diventano un gruppo con il numero; toccandolo la mappa si avvicina.
- Il luogo selezionato non finisce mai dentro un gruppo e non resta sotto la scheda in basso.
- Il percorso del giro è una linea tratteggiata che unisce le tappe in ordine: indica la sequenza, non la strada esatta (per quella ci sono Google Maps e Apple Maps).

## Prossimi passi tecnici

- Funzionamento offline (service worker) per chi non ha dati all'estero.
- Ottimizzare l'ordine delle tappe per ridurre i giri a zig-zag.
- Validare i dati in fase di build per alleggerire l'app.
- Statistiche anonime per il pilota (aperture, giri creati, rientri in orario).
- Collegamento facoltativo con l'app della compagnia (orario della nave inviato in automatico).
