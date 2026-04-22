describe('UniSpot Login Flow', () => {
    it('should successfully log in a student', () => {
        // 1. Visit the login page (app uses /student-login)
        cy.visit('/student-login');

        // 2. Enter credentials using data-testid
        cy.get('[data-testid="student-id"]').type('it23820678');
        cy.get('[data-testid="password"]').type('lashan');

        // 3. Click the login button
        cy.get('[data-testid="login-btn"]').click();

        // 4. Assert redirect to dashboard
        cy.url().should('include', '/student-dashboard');

        // 5. Verify dashboard content is visible
        cy.get('h1').should('contain', 'Welcome back');
    });
});
