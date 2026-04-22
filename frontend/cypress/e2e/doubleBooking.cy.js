describe('Double Booking Prevention', () => {
    // Shared constants for the tests - Use a long-range future date to avoid any conflicts with today's dummy data
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const dateStr = futureDate.toISOString().split('T')[0];

    const studentA = {
        id: 'it23820678',
        password: 'lashan'
    };

    function login(id, password) {
        cy.visit('/student-login');
        cy.get('[data-testid="student-id"]').clear().type(id);
        cy.get('[data-testid="password"]').clear().type(password);
        cy.get('[data-testid="login-btn"]').click();
        cy.url({ timeout: 20000 }).should('include', '/student-dashboard');
    }

    function bookSpot(zoneTestId, slotId, arrival, leaving) {
        cy.visit('/parking/zones');
        // Select zone via data-testid (e.g., zone-08)
        cy.get(`[data-testid="${zoneTestId}"]`, { timeout: 15000 }).should('be.visible').click();
        
        // Select slot via data-testid (e.g., slot-Z08-S01)
        cy.get(`[data-testid="slot-${slotId}"]`, { timeout: 15000 }).click();
        
        // Ensure form is loaded
        cy.get('[data-testid="booking-date-input"]', { timeout: 10000 }).should('be.visible');

        // Fill form
        cy.get('[data-testid="booking-date-input"]').type(dateStr);
        cy.get('[data-testid="arrival-time-input"]').type(arrival);
        cy.get('[data-testid="leaving-time-input"]').type(leaving);
        
        // Confirm
        cy.get('[data-testid="confirm-booking-btn"]').click();
    }

    it('Scenario 1: Should prevent the same user from overlapping their own bookings', () => {
        login(studentA.id, studentA.password);

        // 1. First booking: Zone 08 Slot 1 (10:00 - 11:00)
        bookSpot('zone-08', 'Z08-S01', '10:00', '11:00');
        cy.get('[data-testid="booking-success"]', { timeout: 20000 }).should('be.visible');

        // 2. Second booking attempt: Zone 08 Slot 2 (10:30 - 11:30) -- OVERLAPPING TIME
        bookSpot('zone-08', 'Z08-S02', '10:30', '11:30');

        // 3. Assertion: Error message should appear
        cy.get('[data-testid="parking-error-msg"]', { timeout: 15000 })
            .should('be.visible')
            .should('contain', 'You already have a booking');
    });

    it('Scenario 2: Should prevent two different users from booking the same slot at overlapping times', () => {
        // 1. Student A books Slot 08-S03 (14:00 - 15:00)
        login(studentA.id, studentA.password);
        bookSpot('zone-08', 'Z08-S03', '14:00', '15:00');
        cy.get('[data-testid="booking-success"]', { timeout: 20000 }).should('be.visible');

        // Logout cleanly
        cy.visit('/student-dashboard');
        cy.get('button').contains('Logout').click();
        cy.url({ timeout: 10000 }).should('include', '/student-login');

        // 2. Register Student B (New unique student)
        const uniqueId = `IT${Math.floor(20000000 + Math.random() * 70000000)}`;
        const uniqueEmail = `competitor_${Date.now()}@example.com`;
        
        cy.visit('/student-register');
        cy.get('[data-testid="reg-name"]').type('Competitor User');
        cy.get('[data-testid="reg-student-id"]').type(uniqueId);
        cy.get('[data-testid="reg-phone"]').type('0771112223');
        cy.get('[data-testid="reg-address"]').type('Non-Overlapping St, Colombo');
        cy.get('[data-testid="reg-faculty"]').select('Faculty of Computing');
        cy.get('[data-testid="reg-email"]').type(uniqueEmail);
        cy.get('[data-testid="reg-password"]').type('Password123!');
        cy.get('[data-testid="reg-confirm-password"]').type('Password123!');
        cy.get('[data-testid="reg-photo-input"]').selectFile('cypress/fixtures/profile.png');
        cy.get('[data-testid="reg-submit-btn"]').click();
        
        cy.url({ timeout: 30000 }).should('include', '/student-dashboard');

        // 3. Student B attempts to book THE SAME Slot 08-S03 (14:30 - 15:30) -- OVERLAPPING
        bookSpot('zone-08', 'Z08-S03', '14:30', '15:30');

        // 4. Assertion: Error message should appear
        // If it fails, it might be because the booking succeeded (BUG) or displayed a different error.
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="booking-success"]').length > 0) {
                throw new Error("FAIL: System allowed a double booking for the same slot!");
            }
        });

        cy.get('[data-testid="parking-error-msg"]', { timeout: 20000 })
            .should('be.visible')
            .should('contain', 'This slot is already booked');
    });
});
