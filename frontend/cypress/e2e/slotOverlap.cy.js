describe('Slot Double Booking Prevention', () => {
    // Scenario 2: Two DIFFERENT users, SAME slot, overlapping time
    // Using a hardcoded distant future date to ensure no conflicts with real data
    const dateStr = '2026-06-15'; 

    const studentA = {
        id: 'It23820678',
        password: 'lashan'
    };

    const studentB = {
        id: 'it12345678',
        password: 'lashan2'
    };

    // Before each test, clean up any active booking for BOTH students via API
    beforeEach(() => {
        [studentA, studentB].forEach(student => {
            cy.request({
                method: 'GET',
                url: `http://localhost:5000/api/parking/my-booking/${student.id}`,
                failOnStatusCode: false,
            }).then((resp) => {
                if (resp.status === 200 && resp.body?.data?._id) {
                    const bookingId = resp.body.data._id;
                    cy.request({
                        method: 'PUT',
                        url: `http://localhost:5000/api/parking/${bookingId}/cancel`,
                        failOnStatusCode: false,
                    });
                }
            });
        });
    });

    function login(id, password) {
        cy.visit('/student-login');
        cy.get('[data-testid="student-id"]').clear().type(id);
        cy.get('[data-testid="password"]').clear().type(password);
        cy.get('[data-testid="login-btn"]').click();
        cy.url({ timeout: 20000 }).should('include', '/student-dashboard');
    }

    function bookSpotViaUI(zoneTestId, slotId, arrival, leaving) {
        cy.visit('/parking/zones');
        cy.get(`[data-testid="${zoneTestId}"]`, { timeout: 15000 }).should('be.visible').click();
        cy.get(`[data-testid="slot-${slotId}"]`, { timeout: 15000 }).click();

        // Wait for the form to render and auto-fill to start
        cy.get('[data-testid="confirm-booking-btn"]', { timeout: 10000 }).should('be.visible');

        // Wait for profile auto-fill to complete (validated by student ID field)
        cy.get('[data-testid="student-id-input"]', { timeout: 10000 })
            .should('not.have.value', '');

        // Ensure names are filled (in case profile auto-fill is incomplete)
        cy.get('[data-testid="first-name-input"]').then($el => {
            if (!$el.val()) cy.get('[data-testid="first-name-input"]').type('User');
        });
        cy.get('[data-testid="last-name-input"]').then($el => {
            if (!$el.val()) cy.get('[data-testid="last-name-input"]').type('Two');
        });

        cy.log(`Attempting booking for: ${slotId} on ${dateStr}`);
        
        // Fill form fields
        cy.get('[data-testid="booking-date-input"]').clear().type(dateStr).trigger('change');
        cy.get('[data-testid="arrival-time-input"]').type(arrival);
        cy.get('[data-testid="leaving-time-input"]').type(leaving).trigger('change');
        
        cy.get('[data-testid="confirm-booking-btn"]').click();
    }

    it('Scenario: User B should be blocked from booking a slot User A has already reserved', () => {
        // 1. User A books Slot Z08-S03 (10:00 - 11:00)
        login(studentA.id, studentA.password);
        bookSpotViaUI('zone-08', 'Z08-S03', '10:00', '11:00');
        
        // Assert success for User A
        cy.get('[data-testid="booking-success"]', { timeout: 25000 })
            .should('be.visible')
            .should('contain', 'Confirmed');

        // Logout Student A
        cy.visit('/student-dashboard');
        cy.get('button').contains('Logout').click();
        cy.url({ timeout: 15000 }).should('include', '/student-login');

        // 2. User B tries to book SAME slot at overlapping time (10:30 - 11:30)
        login(studentB.id, studentB.password);
        
        cy.visit('/parking/zones');
        cy.get('[data-testid="zone-08"]', { timeout: 15000 }).should('be.visible').click();
        cy.get('[data-testid="slot-Z08-S03"]', { timeout: 15000 }).click();

        // Wait for form to load
        cy.get('[data-testid="confirm-booking-btn"]', { timeout: 10000 }).should('be.visible');
        cy.get('[data-testid="student-id-input"]', { timeout: 10000 }).should('not.have.value', '');

        // Set the conflict date and times
        cy.get('[data-testid="booking-date-input"]').clear().type(dateStr).trigger('change');
        cy.get('[data-testid="arrival-time-input"]').type('10:30').trigger('change');
        cy.get('[data-testid="leaving-time-input"]').type('11:30').trigger('change');

        // CRITICAL: Wait for the UI to show the 'Booked windows' warning for User A's booking
        // This proves the frontend knows there is a conflict
        cy.contains('⚠️ Booked windows', { timeout: 15000 }).should('be.visible');
        cy.contains('10:00 – 11:00').should('be.visible');

        // Now attempt to submit despite the warning
        cy.get('[data-testid="confirm-booking-btn"]').click();

        // 3. Assertion: Conflict error message should appear
        cy.get('[data-testid="parking-error-msg"]', { timeout: 30000 })
            .should('be.visible')
            .should('contain', 'Time Conflict');
    });
});
