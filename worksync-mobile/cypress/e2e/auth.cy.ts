describe('Flujo de Autenticación y Registro', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test para forzar login
    cy.clearLocalStorage();
  });

  it('Debe registrar un nuevo usuario, iniciar sesión automáticamente, cerrar sesión e iniciar sesión de nuevo', () => {
    const timestamp = Date.now();
    const testUser = `User_${timestamp}`;
    const testEmail = `user_${timestamp}@worksync.com`;
    const testPassword = `Pass123_${timestamp}`;

    // 1. Visitar la raíz y verificar redirección a login
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.contains('Iniciar sesión').should('be.visible');

    // 2. Ir a la vista de registro
    cy.contains('Regístrate aquí').click();
    cy.contains('Crear cuenta').should('be.visible');

    // 3. Rellenar el formulario de registro
    // Buscamos los inputs dentro de los IonItems correspondientes
    cy.get('input[type="text"]').type(testUser);
    cy.get('input[type="email"]').type(testEmail);
    // Hay dos inputs de tipo password (contraseña y confirmar contraseña)
    cy.get('input[type="password"]').first().type(testPassword);
    cy.get('input[type="password"]').last().type(testPassword);
    
    // Seleccionar rol LIDER
    cy.get('select').select('LIDER');

    // Enviar formulario
    cy.get('ion-button.login-submit-btn').click();

    // 4. Verificar redirección automática al Dashboard (ruta protegida)
    cy.url().should('include', '/tabs/dashboard');
    cy.contains('panel de control').should('exist');

    // 5. Cerrar sesión
    cy.get('ion-button[title="Cerrar sesión"]').click();
    cy.url().should('include', '/login');

    // 6. Iniciar sesión de nuevo con las credenciales registradas
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('ion-button.login-submit-btn').click();

    // 7. Confirmar inicio de sesión exitoso
    cy.url().should('include', '/tabs/dashboard');
    cy.contains('panel de control').should('exist');
  });
});
