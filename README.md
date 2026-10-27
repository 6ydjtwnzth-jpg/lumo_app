# Lumo · modalità crociera (prima versione)

Web app che il crocierista apre da un QR code a bordo, senza scaricare nulla.
Dice quanto tempo ha, crea un giro a piedi su misura e lo riporta alla nave in tempo.

Porto coperto: **Napoli** (17 luoghi, dati ancora da verificare).

## Cosa fa oggi

1. **Arrivo**: orario di partenza e di «tutti a bordo», ore a disposizione, interessi (storia, arte, natura, cibo, nascosti, panorami, chiese).
2. **Il tuo giro**: tappe in ordine con orari, minuti a piedi, biglietti e luoghi nascosti. Calcola il rientro con margine di sicurezza.
3. **Tappa**: descrizione, consiglio del local, curiosità a tendina, biglietto, indicazioni con Google Maps o Apple Maps.
4. **Rientro a bordo**: conto alla rovescia, stato (in orario, inizia a rientrare, rientra adesso, in ritardo) con colore **e** icona, pulsante «Portami alla nave».
5. Italiano e inglese, tema chiaro e scuro, rispetto di «riduci movimento».

Il pulsante «Demo: avanti di 30 min» serve solo per mostrare il timer durante una presentazione.

## Comandi

```bash
npm install
npm run dev        # sviluppo, http://localhost:5173
npm test           # test automatici
npm run typecheck  # controllo dei tipi
npm run build      # versione da pubblicare, nella cartella dist/
npm run data:check # controlla i dati dei porti
```

## Aggiungere un porto

1. Copia `src/data/ports/napoli.json` in un nuovo file (es. `palermo.json`).
2. Compila terminal, tempo dei controlli e luoghi. Ogni luogo ha `verified: false` finché qualcuno non controlla coordinate, orari e prezzi su una fonte ufficiale.
3. Registralo in `src/data/ports/index.ts`.
4. Lancia `npm run data:check`: se un dato è sbagliato il test lo dice.

## Prima di usarla con i passeggeri

- Verificare sul posto tutti i luoghi (coordinate, orari, biglietti) e mettere `verified: true`.
- Far confermare a chi gestisce la nave il tempo dei controlli al terminal (`controlsMinutes`).
- L'orario ufficiale resta sempre quello della nave: il messaggio è già in ogni schermata.

Struttura e scelte tecniche: [docs/ARCHITETTURA.md](docs/ARCHITETTURA.md).
