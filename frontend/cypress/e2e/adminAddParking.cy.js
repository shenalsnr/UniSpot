describe('Admin Add Parking Spot', () => {
    const admin = {
        email: 'admin@unispot.com',
        password: 'admin123'
    };

    beforeEach(() => {
        cy.clearLocalStorage();
        // Login as admin
        cy.visit('/admin-login');
        cy.get('[data-testid="admin-email-input"]').type(admin.email);
        cy.get('[data-testid="admin-password-input"]').type(admin.password);
        cy.get('[data-testid="admin-login-submit"]').click();
        cy.url().should('include', '/admin-dashboard');
    });

    it('should successfully add a new parking spot and verify it in the table', () => {
        // 1. Navigate to Parking Records
        cy.visit('/parking/admin');
        
        // 2. Open Add Modal
        cy.get('[data-testid="add-new-spot-btn"]').click();
        cy.get('h2').contains('Create Parking Spot').should('be.visible');

        // 3. Select Zone and verify auto-generation
        cy.get('[data-testid="zone-select"]').select('Zone 08');
        
        // Wait for slot number generation (API call)
        cy.get('[data-testid="slot-number-input"]').should('not.have.value', '');
        cy.get('[data-testid="slot-number-input"]').invoke('val').then((slotNumber) => {
            cy.log(`Generated Slot Number: ${slotNumber}`);
            expect(slotNumber).to.match(/^Z08-S\d{2}$/);

            // 4. Select Vehicle Type and Save
            cy.get('[data-testid="vehicle-type-select"]').select('Motorcycle');
            cy.get('[data-testid="save-spot-btn"]').click();

            // 5. Verify persistence in the table
            cy.get('table').should('be.visible');
            cy.contains('td', slotNumber).should('be.visible');

            // 6. Cleanup: Delete the newly created spot
            // Find the row containing the slotNumber and click the Delete button in that row
            cy.contains('tr', slotNumber).within(() => {
                cy.get('button').contains('Delete').click();
            });
            
            // Confirm browser dialogue if any (Cypress handles window.confirm automatically as TRUE)
            cy.contains('td', slotNumber).should('not.exist');
        });
    });
});
