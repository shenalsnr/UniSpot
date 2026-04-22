describe('UniSpot Locker Booking Flow', () => {
    beforeEach(() => {
        // Log in before each test
        cy.visit('/student-login');
        cy.get('[data-testid="student-id"]').clear().type('it23820678');
        cy.get('[data-testid="password"]').clear().type('lashan');
        cy.get('[data-testid="login-btn"]').click();
        cy.url({ timeout: 15000 }).should('include', '/student-dashboard');
    });

    it('should successfully book a locker', () => {
        // 1. GLOBAL CLEANUP: Go to "My Locker" to ensure any existing bookings are cleared
        // This is necessary because the backend only allows one active locker booking at a time.
        cy.get('[data-testid="my-locker-nav"]').click();
        cy.url().should('include', '/MyBookLocker');
        
        // Wait for loading to finish
        cy.contains('Loading your locker bookings').should('not.exist');

        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="cancel-locker-btn"]').length > 0) {
                cy.log('Existing locker booking(s) found during global cleanup.');
                
                // We'll iterate through and cancel any active bookings
                // Note: The cancel button triggers a custom BeautifulConfirm modal
                cy.get('[data-testid="cancel-locker-btn"]').each(($btn) => {
                    cy.wrap($btn).click();
                    // Click "Yes, Cancel Booking" in the custom confirmation modal
                    cy.contains('Yes, Cancel Booking', { timeout: 5000 }).should('be.visible').click();
                    // Wait for the success alert to appear and then disappear
                    cy.contains('Locker booking cancelled successfully', { timeout: 10000 }).should('be.visible');
                    cy.contains('Locker booking cancelled successfully').should('not.exist');
                });
            } else {
                cy.log('No existing locker bookings found.');
            }
        });

        // 2. Navigate to "Book Locker" via dashboard link
        cy.visit('/student-dashboard'); // Go back to dashboard first for a consistent flow
        cy.get('[data-testid="book-locker-nav"]').click();
        cy.url().should('include', '/lockers');

        // 3. Wait for maps to load and select one
        cy.get('[data-testid="locker-map-select"]', { timeout: 15000 }).should('be.visible');
        cy.get('[data-testid="locker-map-select"] option').should('have.length.at.least', 2);
        cy.contains('Loading maps').should('not.exist');

        // 4. Select an available locker card
        // We look for a locker that has the "Book Locker" button text
        cy.get('[data-testid^="locker-"]').filter(':contains("Book Locker")').first().within(() => {
            cy.get('button').click();
        });

        // 5. Fill and Submit the booking modal
        cy.get('[data-testid="locker-date-input"]', { timeout: 10000 }).should('be.visible');

        // Prepare times dynamically (booking must be between 06:00 and 22:00)
        // Setting a future date (tomorrow) to avoid "past date" errors
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const dateStr = futureDate.toISOString().split('T')[0];

        cy.get('[data-testid="locker-date-input"]').type(dateStr);
        cy.get('[data-testid="locker-start-input"]').type('10:00');
        cy.get('[data-testid="locker-end-input"]').type('15:00');

        // 6. Confirm Booking in the modal
        cy.get('[data-testid="locker-confirm-btn"]').click();

        // 7. Success Check
        // The success message comes from BeautifulAlert
        cy.contains('Locker booked successfully', { timeout: 20000 }).should('be.visible');
    });
});
