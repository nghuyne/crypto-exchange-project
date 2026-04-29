import { AuthProvider } from './context/AuthContext';
import Navigation from './navigation/Navigation';

// styles
import './styles/site.css';

const App: React.FC = () => (
  <AuthProvider>
    <Navigation />
  </AuthProvider>
);

export default App;
