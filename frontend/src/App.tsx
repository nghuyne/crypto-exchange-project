import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './navigation/Navigation';

// styles
import './styles/site.css';

const App: React.FC = () => (
  <ThemeProvider>
    <WebSocketProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </WebSocketProvider>
  </ThemeProvider>
);

export default App;
