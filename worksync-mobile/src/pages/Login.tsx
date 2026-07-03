import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner
} from '@ionic/react';
import useAuth from '../hooks/useAuth';
import { login as loginRequest, register as registerRequest, recuperarContrasena } from '../services/authService';
import './Login.css';

const Login: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();

  // Mode: 'login' | 'recovery' | 'register'
  const [mode, setMode] = useState<'login' | 'recovery' | 'register'>('login');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('COLABORADOR');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      history.replace('/tabs/dashboard');
    }
  }, [auth.isLoading, auth.isAuthenticated, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (mode === 'login' && !password) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    if (mode === 'recovery' && !newPassword) {
      setError('Por favor ingresa tu nueva contraseña.');
      return;
    }

    if (mode === 'register') {
      if (!username) {
        setError('Por favor ingresa tu nombre de usuario.');
        return;
      }
      if (!password) {
        setError('Por favor ingresa tu contraseña.');
        return;
      }
      if (password !== confirmPassword) {
        setError('La contraseña y su confirmación no coinciden.');
        return;
      }
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        setError('La contraseña debe tener al menos 8 caracteres y contener letras y números.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await loginRequest({ email, password });
        auth.login(response);
        history.replace('/tabs/dashboard');
      } else if (mode === 'register') {
        const response = await registerRequest({ username, email, password, rol });
        auth.login(response);
        history.replace('/tabs/dashboard');
      } else {
        const responseText = await recuperarContrasena(email, newPassword);
        setSuccessMsg(responseText || 'Tu contraseña ha sido restablecida con éxito.');
        setMode('login');
        setPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (newMode: 'login' | 'recovery' | 'register') => {
    setError('');
    setSuccessMsg('');
    setMode(newMode);
  };

  if (auth.isAuthenticated) {
    return null;
  }

  return (
    <IonPage>
      <IonContent fullscreen className="login-page-container">
        {/* Luces de Fondo */}
        <div className="login-bg-orb-1"></div>
        <div className="login-bg-orb-2"></div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100%',
          width: '100%'
        }}>
          <div className="login-glass-card">
            {/* Logo */}
            <div className="login-logo">
              Work<span>Sync</span>
            </div>

            {/* Título & Subtítulo dinámico */}
            <h2 className="login-title">
              {mode === 'login' && 'Iniciar sesión'}
              {mode === 'register' && 'Crear cuenta'}
              {mode === 'recovery' && 'Recuperar contraseña'}
            </h2>
            <p className="login-subtitle">
              {mode === 'login' && 'Accede con tu cuenta corporativa para coordinar a tu equipo.'}
              {mode === 'register' && 'Regístrate y empieza a gestionar tus proyectos en tiempo real.'}
              {mode === 'recovery' && 'Ingresa tu correo y la nueva contraseña para restablecer el acceso.'}
            </p>

            {/* Mensajes de feedback */}
            {error && (
              <div className="login-error-container">
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                color: '#34d399',
                fontSize: '13px',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                <span style={{ fontSize: '16px' }}>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="login-form">
              {mode === 'register' && (
                <div>
                  <span className="login-input-label">Nombre de usuario</span>
                  <IonItem lines="none" className="login-input-item">
                    <IonInput
                      type="text"
                      placeholder="Nombre de usuario"
                      value={username}
                      onIonInput={(e) => setUsername(e.detail.value || '')}
                      disabled={loading}
                      required
                    />
                  </IonItem>
                </div>
              )}

              <div>
                <span className="login-input-label">Correo electrónico</span>
                <IonItem lines="none" className="login-input-item">
                  <IonInput
                    type="email"
                    placeholder="usuario@correo.com"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value || '')}
                    disabled={loading}
                    required
                  />
                </IonItem>
              </div>

              {mode === 'login' && (
                <div>
                  <span className="login-input-label">Contraseña</span>
                  <IonItem lines="none" className="login-input-item">
                    <IonInput
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value || '')}
                      disabled={loading}
                      required
                    />
                  </IonItem>
                </div>
              )}

              {mode === 'register' && (
                <>
                  <div>
                    <span className="login-input-label">Contraseña</span>
                    <IonItem lines="none" className="login-input-item">
                      <IonInput
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onIonInput={(e) => setPassword(e.detail.value || '')}
                        disabled={loading}
                        required
                      />
                    </IonItem>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Mínimo 8 caracteres con letras y números.
                    </span>
                  </div>

                  <div>
                    <span className="login-input-label">Confirmar Contraseña</span>
                    <IonItem lines="none" className="login-input-item">
                      <IonInput
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onIonInput={(e) => setConfirmPassword(e.detail.value || '')}
                        disabled={loading}
                        required
                      />
                    </IonItem>
                  </div>

                  <div>
                    <span className="login-input-label">Rol en la plataforma</span>
                    <IonItem lines="none" className="login-input-item">
                      <select
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        disabled={loading}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          padding: '12px 0',
                          outline: 'none',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="COLABORADOR" style={{ background: '#0b0f19' }}>Colaborador</option>
                        <option value="LIDER" style={{ background: '#0b0f19' }}>Líder de Proyecto</option>
                        <option value="ADMIN" style={{ background: '#0b0f19' }}>Administrador (ADMIN)</option>
                      </select>
                    </IonItem>
                  </div>
                </>
              )}

              {mode === 'recovery' && (
                <div>
                  <span className="login-input-label">Nueva Contraseña</span>
                  <IonItem lines="none" className="login-input-item">
                    <IonInput
                      type="password"
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onIonInput={(e) => setNewPassword(e.detail.value || '')}
                      disabled={loading}
                      required
                    />
                  </IonItem>
                </div>
              )}

              <IonButton
                type="submit"
                expand="block"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <IonSpinner name="crescent" color="light" style={{ width: '20px', height: '20px' }} />
                ) : (
                  mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Crear cuenta' : 'Actualizar contraseña'
                )}
              </IonButton>
            </form>

            {/* Footer de links */}
            <div className="login-footer-links">
              {mode === 'login' && (
                <>
                  <span className="login-footer-text">
                    ¿No tienes cuenta?{' '}
                    <span onClick={() => changeMode('register')} className="login-link">
                      Regístrate aquí
                    </span>
                  </span>
                  <span className="login-footer-text">
                    ¿Olvidaste tu contraseña?{' '}
                    <span onClick={() => changeMode('recovery')} className="login-link">
                      Recupérala aquí
                    </span>
                  </span>
                </>
              )}
              {mode === 'register' && (
                <span className="login-footer-text">
                  ¿Ya tienes cuenta?{' '}
                  <span onClick={() => changeMode('login')} className="login-link">
                    Inicia sesión
                  </span>
                </span>
              )}
              {mode === 'recovery' && (
                <span className="login-footer-text">
                  ¿Recordaste tus credenciales?{' '}
                  <span onClick={() => changeMode('login')} className="login-link">
                    Inicia sesión
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
