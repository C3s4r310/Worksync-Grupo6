describe('Módulo de Gestión de Tareas - Offline', () => {
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

  it('Debe navegar a la pestaña de Tareas, filtrar, crear una nueva tarea, ver detalles y comentar en modo offline', () => {
    // 1. Navegar a la pestaña de Tareas (Tab 2)
    cy.get('ion-tab-button[tab="tareas"]').click();
    cy.url().should('include', '/tabs/tareas');
    cy.contains('Centro de Tareas').should('exist');

    // 2. Crear una nueva tarea con el FAB button
    cy.get('.tareas-fab-btn').click();
    cy.contains('Nueva Tarea').should('be.visible');

    const timestamp = Date.now();
    const taskTitle = `Tarea Offline ${timestamp}`;
    const taskDesc = `Descripción offline para el test ${timestamp}`;

    cy.get('input[placeholder="Título de la tarea"]').type(taskTitle);
    cy.get('textarea[placeholder="Escribe detalles adicionales..."]').type(taskDesc);
    cy.get('select.tareas-form-select').first().select(0); // Selecciona el primer proyecto de la lista (Proyecto Worksync Móvil)
    cy.get('select.tareas-form-select').eq(1).select('ALTA'); // Prioridad Alta

    cy.get('button[type="submit"]').click();

    // 3. Confirmar que la tarea fue creada y aparece listada
    cy.contains(taskTitle).should('exist');

    // 4. Abrir detalles de la tarea recién creada
    cy.contains(taskTitle).click();
    cy.contains('Detalles').should('be.visible');
    cy.contains(taskDesc).should('exist');

    // 5. Ir a la pestaña de comentarios y escribir uno
    cy.contains('Comentarios').click();
    cy.get('input[placeholder="Escribe un comentario..."]').type('Comentario local de prueba.');
    cy.get('button.comment-send-btn').click();

    // Verificar que aparezca el comentario en la lista
    cy.contains('Comentario local de prueba.').should('exist');

    // 6. Cerrar detalles
    cy.contains('Cerrar').click();

    // 7. Cambiar estado rápido de la tarea y justificar
    cy.contains('.tarea-card', taskTitle).within(() => {
      cy.get('.tarea-card-status-select').select('EN_PROGRESO');
    });

    // Se abre el modal de justificación
    cy.contains('Justificar cambio de estado').should('be.visible');
    cy.get('textarea').type('Justificación local offline');
    cy.contains('Confirmar').click();

    // Confirmar que el badge cambió a En progreso
    cy.contains('.tarea-card', taskTitle).within(() => {
      cy.contains('En progreso').should('exist');
    });
  });
});
