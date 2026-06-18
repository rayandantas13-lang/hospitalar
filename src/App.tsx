import { useStore } from './store';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FieldInfoModal from './components/FieldInfoModal';
import Recepcao from './modules/Recepcao';
import Triagem from './modules/Triagem';
import Consultorio from './modules/Consultorio';
import Almoxarifado from './modules/Almoxarifado';
import SalaVermelha from './modules/SalaVermelha';
import PainelChamada from './modules/PainelChamada';
import Admin from './modules/Admin';

function ModuleRouter() {
  const { currentModule } = useStore();
  switch (currentModule) {
    case 'dashboard': return <Dashboard />;
    case 'recepcao': return <Recepcao />;
    case 'triagem': return <Triagem />;
    case 'consultorio': return <Consultorio />;
    case 'almoxarifado': return <Almoxarifado />;
    case 'sala_vermelha': return <SalaVermelha />;
    case 'painel_chamada': return <PainelChamada />;
    case 'admin': return <Admin />;
    default: return <Dashboard />;
  }
}

export default function App() {
  const { currentUser } = useStore();
  if (!currentUser) return <LoginScreen />;
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-auto min-h-screen">
        <ModuleRouter />
      </main>
      <FieldInfoModal />
    </div>
  );
}
