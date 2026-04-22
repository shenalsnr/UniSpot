describe('Admin Edit Staff Name Lifecycle', () => {
    const admin = {
        email: 'admin@unispot.com',
        password: 'admin123'
    };

    const targetStaff = {
        originalName: 'Lashan',
        newName: 'Ravihara'
    };

    beforeEach(() => {
        cy.clearLocalStorage();
        // Login as admin
        cy.visit('/admin-login');
        cy.get('[data-testid="admin-email-input"]').type(admin.email);
        cy.get('[data-testid="admin-password-input"]').type(admin.password);
        cy.get('[data-testid="admin-login-submit"]').click();
        cy.url().should('include', '/admin-dashboard');

        // Navigating to Staff Register
        cy.visit('/staff-register');
    });

    it('should edit Lashan to Ravihara, then back to Lashan', () => {
        // 1. Find Lashan and Edit to Ravihara
        cy.contains('tr', targetStaff.originalName).within(() => {
            cy.get('button').contains('Edit').click();
        });
        
        cy.get('[data-testid="staff-name-input"]').clear().type(targetStaff.newName);
        cy.get('[data-testid="staff-submit-btn"]').click();
        
        // Success verification
        cy.get('[data-testid="success-alert"]').should('contain', 'Updated Successfully');
        cy.contains(targetStaff.newName).should('be.visible');
        cy.contains(targetStaff.originalName).should('not.exist');

        // 2. Find Ravihara and Edit back to Lashan
        cy.contains('tr', targetStaff.newName).within(() => {
            cy.get('button').contains('Edit').click();
        });
        
        cy.get('[data-testid="staff-name-input"]').clear().type(targetStaff.originalName);
        cy.get('[data-testid="staff-submit-btn"]').click();

        // Success verification
        cy.get('[data-testid="success-alert"]').should('contain', 'Updated Successfully');
        cy.contains(targetStaff.originalName).should('be.visible');
        cy.contains(targetStaff.newName).should('not.exist');
    });
});
