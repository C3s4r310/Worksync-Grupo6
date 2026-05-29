import React, { useState } from 'react';
import { login } from '../services/authService'; // Ajusta esta ruta si tu carpeta se llama distinto

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const manejarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Limpiamos errores previos

        try {
            await login(username, password);
            // Si funciona, recargamos la página o redirigimos
            window.location.reload(); 
        } catch (err) {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '10px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>WorkSync</h2>
                
                {error && <div style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={manejarSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Usuario / Correo</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: 'white', boxSizing: 'border-box' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: 'white', boxSizing: 'border-box' }}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;