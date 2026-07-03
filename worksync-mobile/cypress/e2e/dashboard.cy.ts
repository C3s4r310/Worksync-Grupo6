describe('Módulo de Dashboard - Offline', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    
    // Iniciar sesión con el usuario Líder precargado en el semillero offline
    cy.visit('/login');
    cy.get('input[type="email"]').type('lider@worksync.com');
    cy.get('input[type="password"]').type('Pass123_');
    cy.get('ion-button.login-submit-btn').click();
    
    // Asegurar que entramos al Dashboard
    cy.url().should('include', '/tabs/dashboard');
  });

  it('Debe mostrar la bienvenida, las tarjetas KPI, las tareas críticas y la bitácora de actividad reciente', () => {
    // 1. Verificar la bienvenida al usuario
    cy.contains('¡Hola, Líder del Proyecto!').should('exist');
    cy.contains('Bienvenido a tu panel de control offline de WorkSync.').should('exist');

    // 2. Verificar existencia de las tarjetas KPI
    cy.contains('Proyectos').should('exist');
    cy.contains('Mis Tareas').should('exist');
    cy.contains('Urgentes').should('exist');

    // 3. Verificar sección de Tareas Críticas
    cy.contains('Tareas Críticas y Altas').should('exist');
    
    // Al menos debe listar las tareas críticas iniciales del semillero (ej. "Diseñar pantalla de login")
    cy.contains('Diseñar pantalla de login').should('exist');

    // 4. Verificar sección de Actividad Reciente
    cy.contains('Actividad Reciente').should('exist');
    
    // Debe listar cambios anteriores (ej. "Juan Colaborador")
    cy.contains('Juan Colaborador').should('exist');
    cy.contains('Cambió el estado de la tarea').should('exist');
  });
});
