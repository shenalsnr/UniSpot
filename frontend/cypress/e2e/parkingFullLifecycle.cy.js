describe('Full Parking Lifecycle (Booking -> Arrival -> Departure)', () => {
    const studentId = 'it23820678';
    const password = 'lashan';

    beforeEach(() => {
        // Clear any existing bookings for this student via DB first for absolute clean state
        cy.exec('node C:/Users/lasha/Desktop/UniSpot/backend/scratch/parking_cleanup_it23820678.js', { 
            cwd: 'C:/Users/lasha/Desktop/UniSpot/backend' 
        });
    });

    it('should complete the entire cycle from booking to departure', () => {
        // ── STEP 1: STUDENT BOOKING ──
        cy.visit('/student-login');
        cy.get('[data-testid="student-id"]').type(studentId);
        cy.get('[data-testid="password"]').type(password);
        cy.get('[data-testid="login-btn"]').click();
        cy.url({ timeout: 15000 }).should('include', '/student-dashboard');

        // Navigate to booking
        cy.get('[data-testid="my-parking-nav"]').click();
        cy.url().should('include', '/my-booking');
        
        // Click Book (Assumes no active booking due to cleanup)
        cy.get('[data-testid="book-slot-btn"]', { timeout: 10000 }).should('be.visible').click();

        // Select Zone 01 (most reliably has slots)
        cy.url().should('include', '/parking/zones');
        cy.get('[data-testid="zone-01"]', { timeout: 10000 }).should('be.visible').click({ force: true });

        // Select first available slot (exclude maintenance)
        cy.url().should('include', '/parking/map');
        cy.get('[data-testid^="slot-"]')
            .not(':contains("Maintenance")')
            .should('be.visible')
            .first()
            .click();

        // Fill Form
        cy.url().should('include', '/parking/book/');
        
        // Prepare times: next hour
        const now = new Date();
        const startHour = now.getHours();
        const endHour = (now.getHours() + 1) % 24;
        const pad = (num) => String(num).padStart(2, '0');
        
        const arrivalTime = `${pad(startHour)}:00`;
        const leavingTime = `${pad(endHour)}:00`;
        const bookingDate = now.toISOString().split('T')[0];

        // Fill form fields (some might be autofilled)
        cy.get('[data-testid="booking-date-input"]').clear().type(bookingDate);
        cy.get('[data-testid="arrival-time-input"]').clear().type(arrivalTime);
        cy.get('[data-testid="leaving-time-input"]').clear().type(leavingTime);

        cy.get('[data-testid="confirm-booking-btn"]').click();

        // Verify Success
        cy.get('[data-testid="booking-success"]', { timeout: 20000 })
            .should('be.visible')
            .should('contain', 'Booking Confirmed!');

        // ── STEP 2: SECURITY ARRIVAL ──
        cy.visit('/security');
        cy.contains('📱 QR Scanner').click();
        cy.get('[data-testid="manual-mode-btn"]').click();

        cy.get('[data-testid="qr-manual-input"]').type(studentId.toUpperCase());
        cy.get('[data-testid="qr-submit-btn"]').click();

        // Verify Arrival
        cy.get('[data-testid="arrival-result-card"]', { timeout: 15000 }).should('be.visible');
        cy.contains('Arrival Recorded').should('be.visible');

        // ── STEP 3: SECURITY DEPARTURE ──
        cy.get('[data-testid="scan-next-btn"]').click();
        
        cy.get('[data-testid="qr-manual-input"]').type(studentId.toUpperCase());
        cy.get('[data-testid="qr-submit-btn"]').click();

        // Verify Departure
        cy.get('[data-testid="departure-result-card"]', { timeout: 15000 }).should('be.visible');
        cy.contains('Departure Confirmed').should('be.visible');
    });
});
