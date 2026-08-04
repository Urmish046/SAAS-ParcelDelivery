import { Provider } from 'react-redux';
import { store } from './store/store';
import AppRoutes from './routes/AppRoutes';
import { TenantGuard } from './components/TenantGuard';
import { UiProvider } from './context/UiContext';
import InstallBanner from './components/InstallBanner'; 

function App() {
  return (
    <Provider store={store}>
      <UiProvider>
        <TenantGuard>
          <AppRoutes />
          <InstallBanner /> 
        </TenantGuard>
      </UiProvider>
    </Provider>
  );
}

export default App;