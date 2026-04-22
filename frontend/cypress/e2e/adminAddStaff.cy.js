describe('Admin Add Security Staff', () => {
    const admin = {
        email: 'admin@unispot.com',
        password: 'admin123'
    };

    const newStaff = {
        name: 'Test Security Officer ' + Math.floor(Math.random() * 1000),
        nic: '99' + Math.floor(10000000 + Math.random() * 90000000), // Random 10-digit NIC
        phone: '077' + Math.floor(1000000 + Math.random() * 9000000), // Random 10-digit Phone
        designation: 'Security Guard',
        shift: 'Night',
        gate: 'Gate B'
    };

    beforeEach(() => {
        cy.clearLocalStorage();
        // Login as admin
        cy.visit('/admin-login');
        cy.get('[data-testid="admin-email-input"]').type(admin.email);
        cy.get('[data-testid="admin-password-input"]').type(admin.password);
        cy.get('[data-testid="admin-login-submit"]').click();
        cy.url().should('include', '/admin-dashboard');

        // Navigating to Staff Register (via Sidebar assuming it exists or direct URL)
        cy.visit('/staff-register');
    });

    it('should successfully register a new security staff member', () => {
        // 1. Open Modal
        cy.get('[data-testid="add-staff-btn"]').click();
        cy.contains('Register New Staff').should('be.visible');

        // 2. Fill Form
        cy.get('[data-testid="staff-name-input"]').type(newStaff.name);
        cy.get('[data-testid="staff-nic-input"]').type(newStaff.nic);
        cy.get('[data-testid="staff-phone-input"]').type(newStaff.phone);
        cy.get('[data-testid="staff-designation-select"]').select(newStaff.designation);
        cy.get('[data-testid="staff-shift-select"]').select(newStaff.shift);
        cy.get('[data-testid="staff-gate-select"]').select(newStaff.gate);

        // 3. Submit
        cy.get('[data-testid="staff-submit-btn"]').click();

        // 4. Verify Success
        cy.get('[data-testid="success-alert"]').should('contain', 'Registered Successfully');

        // 5. Verify table entry
        cy.visit('/staff-register'); // Ensure table is refreshed
        cy.contains('tr', newStaff.name).within(() => {
            cy.get('td').contains(newStaff.nic).should('be.visible');
            cy.get('td').contains(newStaff.phone).should('be.visible');
            cy.get('td').contains(newStaff.shift).should('be.visible');
            cy.get('td').contains(newStaff.gate).should('be.visible');
        });
    });

    it('should cleanup by deleting the test staff member', () => {
        cy.visit('/staff-register');
        cy.contains('tr', newStaff.name).within(() => {
            cy.get('button').contains('Delete').click();
        });
        
        // Confirm deletion (Cypress auto-confirms)
        cy.get('[data-testid="success-alert"]').should('contain', 'Deleted Successfully');
        cy.contains(newStaff.name).should('not.exist');
    });
});
