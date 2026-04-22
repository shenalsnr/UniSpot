describe('User Double Booking Prevention', () => {
    // Scenario 1: Same user tries to book a second slot while already having an active one

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const dateStr = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const studentA = {
        id: 'it23820678',
        password: 'lashan'
    };

    // Before each test, cancel any active booking for studentA via API to ensure a clean state
    beforeEach(() => {
        cy.request({
            method: 'GET',
            url: `http://localhost:5000/api/parking/my-booking/${studentA.id}`,
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

    function login(id, password) {
        cy.visit('/student-login');
        cy.get('[data-testid="student-id"]').clear().type(id);
        cy.get('[data-testid="password"]').clear().type(password);
        cy.get('[data-testid="login-btn"]').click();
        cy.url({ timeout: 20000 }).should('include', '/student-dashboard');
    }

    function fillAndSubmitBookingForm(arrival, leaving) {
        // Wait for the form to load and auto-fill to complete
        cy.get('[data-testid="confirm-booking-btn"]', { timeout: 10000 }).should('be.visible');

        // Wait for the student ID to be auto-filled from the profile API
        cy.get('[data-testid="student-id-input"]', { timeout: 10000 })
            .should('not.have.value', '');

        // Set the date reliably without keyboard input glitches
        cy.get('[data-testid="booking-date-input"]').invoke('val', dateStr).trigger('change');

        cy.get('[data-testid="arrival-time-input"]').type(arrival);
        cy.get('[data-testid="leaving-time-input"]').type(leaving);

        cy.get('[data-testid="confirm-booking-btn"]').click();
    }

    function bookSpot(zoneTestId, slotId, arrival, leaving) {
        cy.visit('/parking/zones');
        cy.get(`[data-testid="${zoneTestId}"]`, { timeout: 15000 }).should('be.visible').click();
        cy.get(`[data-testid="slot-${slotId}"]`, { timeout: 15000 }).click();
        fillAndSubmitBookingForm(arrival, leaving);
    }

    it('Scenario 1: Should prevent the same user from making a second booking while one is active', () => {
        login(studentA.id, studentA.password);

        // 1. First booking: Zone 08, Slot 1 (10:00 - 11:00) — should SUCCEED
        bookSpot('zone-08', 'Z08-S01', '10:00', '11:00');

        // Report any unexpected errors before success check
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="parking-error-msg"]').length > 0) {
                const msg = $body.find('[data-testid="parking-error-msg"]').text();
                throw new Error(`First booking should have succeeded but got error: ${msg}`);
            }
        });

        cy.get('[data-testid="booking-success"]', { timeout: 20000 }).should('be.visible');

        // 2. Second booking attempt: Zone 08, Slot 2 (any time) — should FAIL
        bookSpot('zone-08', 'Z08-S02', '10:30', '11:30');

        // 3. Assertion: Error message should appear — system prevents second active booking
        // The backend blocks the second booking, either by:
        //   (a) strict one-booking-per-student rule: "You already have an active booking..."
        //   (b) time-overlap rule (older logic): "You already have a booking...Bookings cannot overlap."
        cy.get('[data-testid="parking-error-msg"]', { timeout: 20000 })
            .should('be.visible')
            .invoke('text')
            .then((text) => {
                cy.log('Actual error message: ' + text);
                const isBlocked =
                    text.includes('already have an active booking') ||
                    text.includes('already have a booking') ||
                    text.includes('cannot overlap') ||
                    text.includes('Only one parking booking');
                expect(isBlocked, `Expected a double-booking error but got: "${text}"`).to.be.true;
            });
    });
});
