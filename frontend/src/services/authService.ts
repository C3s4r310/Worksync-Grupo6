// authService.ts
export const login = async (username: string, password: string) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: username, password }),
    });

    if (!response.ok) {
        throw new Error('Credenciales incorrectas o problema de conexión');
    }

    const token = await response.text();
    
    // Guardamos el "gafete" en el navegador
    sessionStorage.setItem('token', token);
    
    return token;
};

export const logout = () => {
    sessionStorage.removeItem('token');
};

export const isAuthenticated = () => {
    return sessionStorage.getItem('token') !== null;
};