describe('Admin Student Block/Unblock Flow', () => {
    const adminEmail = 'admin@unispot.com';
    const adminPass = 'admin123'; // Standard test password used in previous sessions
    const targetStudentId = 'IT23820678';

    beforeEach(() => {
        // Prepare DB state
        cy.exec('node C:/Users/lasha/Desktop/UniSpot/backend/scratch/admin_test_prep.js', { 
            cwd: 'C:/Users/lasha/Desktop/UniSpot/backend' 
        });

        // Log in as Admin
        cy.visit('/admin-login');
        cy.get('[data-testid="admin-email-input"]').type(adminEmail);
        cy.get('[data-testid="admin-password-input"]').type(adminPass);
        cy.get('[data-testid="admin-login-submit"]').click();
        cy.url({ timeout: 15000 }).should('include', '/admin-dashboard');
    });

    it('should successfully block and then unblock a student', () => {
        // 1. Search for student
        cy.get('[data-testid="student-search-input"]').type(targetStudentId);
        
        // 2. Click View Details
        cy.get(`[data-testid="view-details-btn-${targetStudentId}"]`).click();

        // 3. Verify initial status is Active
        cy.get('[data-testid="student-status-badge"]').first().should('contain', 'Active');

        // 4. Block Student
        // Stub the prompt for block reason
        cy.window().then((win) => {
            cy.stub(win, 'prompt').returns('Violating parking rules systematically.');
        });

        cy.get('[data-testid="block-student-btn"]').click();

        // 5. Verify status changed to Blocked
        cy.get('[data-testid="student-status-badge"]').first().should('contain', 'Blocked');
        cy.contains('Violating parking rules systematically.').should('be.visible');

        // 6. Unblock Student
        cy.get('[data-testid="unblock-student-btn"]').click();

        // 7. Verify status returned to Active
        cy.get('[data-testid="student-status-badge"]').first().should('contain', 'Active');
    });
});
