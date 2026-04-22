describe('Admin Locker Management', () => {
    const adminCredentials = {
        email: 'admin@unispot.com',
        password: 'admin123'
    };

    const testMap = {
        // Frontend strips numbers, so we use letters only for the test name
        location: `TestRoom${Array(4).fill(null).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')}`,
        rows: '4',
        lockersPerRow: '5'
    };

    beforeEach(() => {
        // Ensure all columns are visible in the table
        cy.viewport(1500, 1000);

        // Clear local storage to ensure fresh login
        cy.clearLocalStorage();
        
        // Login as Admin
        cy.visit('/admin-login');
        cy.get('[data-testid="admin-email-input"]').type(adminCredentials.email);
        cy.get('[data-testid="admin-password-input"]').type(adminCredentials.password);
        cy.get('[data-testid="admin-login-submit"]').click();
        
        // Should redirect to dashboard
        cy.url().should('include', '/admin-dashboard');
    });

    it('should successfully add a new locker map', () => {
        // Navigate to Locker Map management
        cy.visit('/AdminLockerMap');

        // Fill out the creation form
        cy.get('[data-testid="location-name-input"]').type(testMap.location);
        cy.get('[data-testid="rows-input"]').type(testMap.rows);
        cy.get('[data-testid="lockers-per-row-input"]').type(testMap.lockersPerRow);

        // Submit the form
        cy.get('[data-testid="create-map-submit"]').click();

        // Verify success (check for the location name in the table)
        cy.contains(testMap.location, { timeout: 10000 }).should('be.visible');
        
        // Verify the values in the same row
        cy.contains(testMap.location)
            .parents('[data-testid="locker-map-row"]')
            .within(() => {
                // Column 0: Location, Column 1: Rows, Column 2: LockersPerRow
                cy.get('td').eq(1).should('contain', testMap.rows);
                cy.get('td').eq(2).should('contain', testMap.lockersPerRow);
            });
    });

    after(() => {
        // Cleanup: Delete the test map
        cy.visit('/AdminLockerMap');
        cy.contains(testMap.location)
            .parents('[data-testid="locker-map-row"]')
            .within(() => {
                cy.contains('button', 'Delete').click();
            });
        
        // Verify deletion (it shouldn't be in the table anymore)
        cy.contains(testMap.location).should('not.exist');
    });
});
