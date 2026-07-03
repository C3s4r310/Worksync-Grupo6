import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { gridOutline, listOutline, chatbubblesOutline } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Chat from './pages/Chat';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const MainTabsLayout: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tabs/dashboard">
        <Tab1 />
      </Route>
      <Route exact path="/tabs/tareas">
        <Tab2 />
      </Route>
      <Route exact path="/tabs/chat">
        <Chat />
      </Route>
      <Route exact path="/tabs">
        <Redirect to="/tabs/dashboard" />
      </Route>
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="dashboard" href="/tabs/dashboard">
        <IonIcon aria-hidden="true" icon={gridOutline} />
        <IonLabel>Dashboard</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tareas" href="/tabs/tareas">
        <IonIcon aria-hidden="true" icon={listOutline} />
        <IonLabel>Tareas</IonLabel>
      </IonTabButton>
      <IonTabButton tab="chat" href="/tabs/chat">
        <IonIcon aria-hidden="true" icon={chatbubblesOutline} />
        <IonLabel>Chat</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const App: React.FC = () => (
  <AuthProvider>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Ruta pública de Login (sin IonTabBar) */}
          <Route exact path="/login">
            <Login />
          </Route>

          {/* Rutas privadas envueltas en la barra de navegación de pestañas */}
          <Route path="/tabs">
            <ProtectedRoute>
              <MainTabsLayout />
            </ProtectedRoute>
          </Route>

          {/* Redirección por defecto */}
          <Route exact path="/">
            <Redirect to="/tabs/dashboard" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </AuthProvider>
);

export default App;
