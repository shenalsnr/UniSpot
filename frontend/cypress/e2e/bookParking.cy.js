describe('UniSpot Parking Booking Flow', () => {
    beforeEach(() => {
        // Log in before each test
        cy.visit('/student-login');
        cy.get('[data-testid="student-id"]').clear().type('it23820678');
        cy.get('[data-testid="password"]').clear().type('lashan');
        cy.get('[data-testid="login-btn"]').click();
        cy.url({ timeout: 15000 }).should('include', '/student-dashboard');
    });

    it('should successfully book a parking spot in Zone 08', () => {
        // 1. Navigate to "My Parking" via dashboard link
        cy.get('[data-testid="my-parking-nav"]').click();
        cy.url().should('include', '/my-booking');

        // Wait for the page to transition away from the "Loading" state
        cy.contains('Loading booking details', { timeout: 15000 }).should('not.exist');
        
        // Wait for EITHER the book button OR the cancel button to appear.
        // This ensures the application has finished its data fetch and rendered one of the two states.
        cy.get('body').should(($body) => {
            const hasBookBtn = $body.find('[data-testid="book-slot-btn"]').length > 0;
            const hasCancelBtn = $body.find('[data-testid="cancel-booking-btn"]').length > 0;
            expect(hasBookBtn || hasCancelBtn, 'Expected either a book button or a cancel button to be rendered').to.be.true;
        });

        // Cleanup: If a booking already exists, cancel it to make the "Book" button available
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="cancel-booking-btn"]').length > 0) {
                cy.log('Existing booking found. Cleaning up...');
                // Stub the window.confirm to automatically say "OK"
                cy.window().then((win) => {
                    cy.stub(win, 'confirm').returns(true);
                });
                cy.get('[data-testid="cancel-booking-btn"]').click();
                
                // Confirm the cancel button is gone and the book button has appeared
                cy.get('[data-testid="cancel-booking-btn"]').should('not.exist');
                cy.get('[data-testid="book-slot-btn"]', { timeout: 15000 }).should('be.visible');
            } else {
                cy.log('No existing booking found. Proceeding...');
            }
        });

        // 2. Click "Book Parking Slot" button (data-testid="book-slot-btn")
        cy.get('[data-testid="book-slot-btn"]').should('be.visible').click();

        // 3. Select Zone 08 on Campus Map
        cy.url().should('include', '/parking/zones');
        // Wait for the SVG map to be ready and click Zone 08
        cy.get('[data-testid="zone-08"]', { timeout: 10000 }).should('be.visible').click({ force: true });

        // 4. Select an available slot on Parking Map
        cy.url().should('include', '/parking/map');
        // Wait for at least one slot to load
        cy.get('[data-testid^="slot-"]', { timeout: 15000 }).should('be.visible').first().click();

        // 5. Fill and Submit the booking form
        cy.url().should('include', '/parking/book/');
        
        // Prepare times dynamically to avoid past-time errors
        const now = new Date();
        const arrivalHour = (now.getHours() + 1) % 24;
        const leavingHour = (now.getHours() + 2) % 24;
        const pad = (num) => String(num).padStart(2, '0');
        
        const arrivalTime = `${pad(arrivalHour)}:00`;
        const leavingTime = `${pad(leavingHour)}:00`;

        cy.get('[data-testid="arrival-time-input"]', { timeout: 10000 }).type(arrivalTime);
        cy.get('[data-testid="leaving-time-input"]').type(leavingTime);

        // 6. Confirm Booking
        cy.get('[data-testid="confirm-booking-btn"]').click();

        // 7. Success Check
        cy.get('[data-testid="booking-success"]', { timeout: 20000 })
            .should('be.visible')
            .should('contain', 'Booking Confirmed!');
    });
});
