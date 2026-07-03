import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      history.replace('/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, history]);

  if (auth.isLoading || !auth.isAuthenticated) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: 'var(--ion-background-color, #0f172a)'
          }}>
            <IonSpinner name="crescent" color="primary" style={{ transform: 'scale(1.5)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--ion-color-medium, #94a3b8)', fontSize: '15px', fontWeight: 500 }}>
              Verificando sesión...
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return <>{children}</>;
}
