import { PORTS } from './data/ports';
import { Arrivo } from './screens/Arrivo';
import { Giro } from './screens/Giro';
import { Tappa } from './screens/Tappa';
import { Timer } from './screens/Timer';
import { useCruise } from './state/useCruise';

// The first version covers a single port; the QR code on board will carry the port id.
const port = PORTS.napoli!;

export function App() {
  const [s, a] = useCruise(port);
  const props = { port, s, a };
  switch (s.screen) {
    case 'giro':
      return <Giro {...props} />;
    case 'tappa':
      return <Tappa {...props} />;
    case 'timer':
      return <Timer {...props} />;
    default:
      return <Arrivo {...props} />;
  }
}
