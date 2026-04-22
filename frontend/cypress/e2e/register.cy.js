describe('Student Registration Flow', () => {
    it('should successfully register a new student', () => {
        // Generate unique data for registration to avoid "Already exists" errors
        // Format: IT + random 8 digits
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
        const uniqueId = `IT${randomDigits}`;
        const uniqueEmail = `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
        
        cy.visit('/student-register');

        // 1. Fill out the registration form
        cy.get('[data-testid="reg-name"]').type('Test Student User');
        cy.get('[data-testid="reg-student-id"]').type(uniqueId);
        cy.get('[data-testid="reg-phone"]').type('0771234567');
        cy.get('[data-testid="reg-address"]').type('123 Test Street, Colombo');
        
        // Wait for Faculty to be interactive
        cy.get('[data-testid="reg-faculty"]').should('be.visible').select('Faculty of Computing');
        
        cy.get('[data-testid="reg-email"]').type(uniqueEmail);
        
        // Wait for email validation to finish
        // We use a longer timeout for the "Email is available" message from the backend
        cy.contains('Email is available', { timeout: 15000 }).should('be.visible');
        
        cy.get('[data-testid="reg-password"]').type('password123');
        cy.get('[data-testid="reg-confirm-password"]').type('password123');

        // 2. Upload the profile photo
        cy.get('[data-testid="reg-photo-input"]').selectFile('cypress/fixtures/profile.png');

        // 3. Submit the form
        cy.get('[data-testid="reg-submit-btn"]').click();

        // 4. Assert success or log failure reason
        // We wait for the dashboard, but if we see an error message, we fail with that message
        cy.wait(1000); // Small wait for any immediate response
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="reg-error-message"]').length > 0) {
                const error = $body.find('[data-testid="reg-error-message"]').text();
                throw new Error(`Registration failed with error: ${error}`);
            }
        });

        cy.url({ timeout: 30000 }).should('include', '/student-dashboard');
        
        // 5. Verify the dashboard content is visible
        cy.contains('Active Portal', { timeout: 15000 }).should('be.visible');
        cy.contains(uniqueId).should('be.visible');
    });

    it('should show an error if passwords do not match', () => {
        cy.visit('/student-register');

        cy.get('[data-testid="reg-name"]').type('Mismatched Password Student');
        cy.get('[data-testid="reg-student-id"]').type('IT11111111');
        cy.get('[data-testid="reg-phone"]').type('0771234567');
        cy.get('[data-testid="reg-address"]').type('123 Test Street');
        cy.get('[data-testid="reg-faculty"]').select('Faculty of Engineering');
        
        cy.get('[data-testid="reg-password"]').type('pass1');
        cy.get('[data-testid="reg-confirm-password"]').type('pass2');
        
        // Fill the photo too since it's required
        cy.get('[data-testid="reg-photo-input"]').selectFile('cypress/fixtures/profile.png');

        // Try to submit
        cy.get('[data-testid="reg-submit-btn"]').click();

        // Should show validation error
        cy.get('[data-testid="reg-error-message"]', { timeout: 10000 })
            .should('be.visible')
            .should('contain', 'Passwords do not match');
    });
});
