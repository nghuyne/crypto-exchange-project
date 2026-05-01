import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import Navigation from './navigation/Navigation';

// styles
import './styles/site.css';

const App: React.FC = () => (
  <WebSocketProvider>
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  </WebSocketProvider>
);

export default App;
