import type { Category } from '../domain/schema';

export type Lang = 'it' | 'en';

const it = {
  cruiseMode: 'Modalità crociera',
  welcome: 'Benvenuto a {city}',
  moored: 'Nave ormeggiata: {terminal}',
  allAboard: 'Tutti a bordo alle',
  startAt: 'Parti alle',
  youHave: 'Hai {time}',
  howLong: 'Quanto vuoi stare in giro?',
  hours: '{n} ore',
  interests: 'Cosa ti va?',
  createTour: 'Crea il mio giro da {n} ore',
  excursions: 'Preferisci un’escursione organizzata? Chiedi al banco escursioni della nave.',
  tourTitle: 'Il tuo giro',
  backAt: 'Al porto alle {time}',
  margin: 'Margine di sicurezza: {time}',
  walk: '{n} min a piedi',
  hidden: 'Nascosto',
  ticket: 'Biglietto',
  toVerify: 'Info da verificare',
  directions: 'Indicazioni',
  startTour: 'Avvia giro e timer',
  edit: 'Modifica',
  noTime: 'Non c’è abbastanza tempo per un giro: goditi il porto e rientra con calma.',
  back: 'Indietro',
  curiosities: 'Curiosità',
  localTip: 'Il consiglio del local',
  visit: 'Visita: {n} min',
  timerTitle: 'Rientro a bordo',
  left: 'Mancano',
  toAllAboard: 'a «tutti a bordo»',
  leaveBy: 'Parti verso la nave entro le {time}',
  walkBack: 'Sei a {n} min a piedi dalla nave',
  atPort: 'Sei al porto, vicino alla nave',
  statusOk: 'Sei in orario',
  statusOkText: 'Hai ancora {time} liberi prima di rientrare.',
  statusSoon: 'Inizia a rientrare',
  statusSoonText: 'Tra {time} è ora di tornare verso la nave.',
  statusNow: 'Rientra adesso',
  statusNowText: 'Parti ora per salire a bordo con calma.',
  statusLate: 'Sei in ritardo',
  statusLateText: 'Prendi un taxi verso il porto e chiama il numero di emergenza della nave.',
  takeMeToShip: 'Portami alla nave',
  useMyPosition: 'Usa la mia posizione',
  positionOn: 'Posizione attiva',
  positionEstimated: 'Posizione stimata dal giro',
  nextStop: 'Prossima tappa',
  demoForward: 'Demo: avanti di 30 min',
  disclaimer: 'L’orario ufficiale è quello comunicato dalla nave. Lumo è un aiuto, non lo sostituisce.',
  language: 'English',
  levels: ['Poco', 'Medio', 'Tanto'],
  categories: {
    storia: 'Storia', arte: 'Arte', natura: 'Natura', cibo: 'Cibo',
    nascosti: 'Nascosti', panorami: 'Panorami', chiese: 'Chiese',
  } satisfies Record<Category, string>,
};

type Dict = typeof it;

const en: Dict = {
  cruiseMode: 'Cruise mode',
  welcome: 'Welcome to {city}',
  moored: 'Ship moored at: {terminal}',
  allAboard: 'All aboard at',
  startAt: 'Leaving at',
  youHave: 'You have {time}',
  howLong: 'How long do you want to explore?',
  hours: '{n} hours',
  interests: 'What are you into?',
  createTour: 'Plan my {n}-hour walk',
  excursions: 'Prefer an organised excursion? Ask at the ship’s excursion desk.',
  tourTitle: 'Your walk',
  backAt: 'Back at port by {time}',
  margin: 'Safety margin: {time}',
  walk: '{n} min walk',
  hidden: 'Hidden gem',
  ticket: 'Ticket',
  toVerify: 'Info to be checked',
  directions: 'Directions',
  startTour: 'Start walk and timer',
  edit: 'Edit',
  noTime: 'Not enough time for a walk: enjoy the port and head back calmly.',
  back: 'Back',
  curiosities: 'Did you know?',
  localTip: 'Local tip',
  visit: 'Visit: {n} min',
  timerTitle: 'Back on board',
  left: 'Time left',
  toAllAboard: 'until «all aboard»',
  leaveBy: 'Head to the ship by {time}',
  walkBack: 'You are a {n} min walk from the ship',
  atPort: 'You are at the port, close to the ship',
  statusOk: 'You are on time',
  statusOkText: 'You still have {time} free before heading back.',
  statusSoon: 'Start heading back',
  statusSoonText: 'In {time} it’s time to walk back to the ship.',
  statusNow: 'Head back now',
  statusNowText: 'Leave now to board calmly.',
  statusLate: 'You are running late',
  statusLateText: 'Take a taxi to the port and call the ship’s emergency number.',
  takeMeToShip: 'Take me to the ship',
  useMyPosition: 'Use my location',
  positionOn: 'Location on',
  positionEstimated: 'Location estimated from your walk',
  nextStop: 'Next stop',
  demoForward: 'Demo: skip 30 min',
  disclaimer: 'The official time is the one announced by the ship. Lumo helps, it does not replace it.',
  language: 'Italiano',
  levels: ['A little', 'Some', 'A lot'],
  categories: {
    storia: 'History', arte: 'Art', natura: 'Nature', cibo: 'Food',
    nascosti: 'Hidden', panorami: 'Views', chiese: 'Churches',
  },
};

const DICTS: Record<Lang, Dict> = { it, en };

type TextKey = { [K in keyof Dict]: Dict[K] extends string ? K : never }[keyof Dict];

export function t(lang: Lang, key: TextKey, vars: Record<string, string | number> = {}): string {
  return DICTS[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''));
}

export function dict(lang: Lang): Dict {
  return DICTS[lang];
}
