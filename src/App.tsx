import { BottomNav } from './components/ui';
import { PORTS } from './data/ports';
import { Arrivo } from './screens/Arrivo';
import { Esplora } from './screens/Esplora';
import { Giro } from './screens/Giro';
import { Tappa } from './screens/Tappa';
import { Timer } from './screens/Timer';
import { useCruise, type Screen } from './state/useCruise';

// The first version covers a single port; the QR code on board will carry the port id.
const port = PORTS.napoli!;

export function App() {
  const [s, a] = useCruise(port);
  const props = { port, s, a };

  // "My walk" opens the setup until a walk has been planned once.
  const onNav = (next: Screen) => a.go(next === 'giro' && !s.planned ? 'arrivo' : next);

  let screen;
  switch (s.screen) {
    case 'esplora':
      screen = <Esplora {...props} />;
      break;
    case 'giro':
      screen = <Giro {...props} />;
      break;
    case 'tappa':
      screen = <Tappa {...props} />;
      break;
    case 'timer':
      screen = <Timer {...props} />;
      break;
    default:
      screen = <Arrivo {...props} />;
  }

  return (
    <div className={`app app-${s.screen}`}>
      {screen}
      {s.screen !== 'tappa' && <BottomNav lang={s.lang} current={s.screen} onGo={onNav} />}
    </div>
  );
}
