import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppRoutes from './routes/AppRoutes';
import { TenantGuard } from './components/TenantGuard';

function App() {
  return (
    <Provider store={store}>
      <TenantGuard>
        <AppRoutes />
      </TenantGuard>
    </Provider>
  );
}

export default App;