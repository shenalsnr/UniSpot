describe('Parking QR Scan (Arrival and Departure)', () => {
    const studentId = 'IT12345678';

    before(() => {
        // Setup the test booking in the database
        // Using absolute path and correct context
        cy.exec('node C:/Users/lasha/Desktop/UniSpot/backend/scratch/setup_test_booking.js', { 
            cwd: 'C:/Users/lasha/Desktop/UniSpot/backend',
            failOnNonZeroExit: true 
        }).then((result) => {
            const data = JSON.parse(result.stdout.split('\n').filter(line => line.startsWith('{')).pop());
            cy.log(`Test set up for Student: ${data.studentId} on Slot: ${data.slotNumber}`);
        });
    });

    it('should successfully complete the arrival and departure lifecycle', () => {
        // 1. Visit Security Scan Page
        cy.visit('/security');
        
        // 2. Switch to Scanner Tab
        cy.contains('📱 QR Scanner').click();

        // 3. Switch to Manual Mode
        cy.get('[data-testid="manual-mode-btn"]').click();
        
        // --- ARRIVAL ---
        // 4. Enter Student ID for Arrival
        cy.get('[data-testid="qr-manual-input"]').type(studentId);
        cy.get('[data-testid="qr-submit-btn"]').click();

        // 5. Verify Arrival Success
        cy.get('[data-testid="arrival-result-card"]').should('be.visible');
        cy.get('[data-testid="arrival-result-card"]').within(() => {
            cy.contains(studentId).should('be.visible');
            cy.contains('Arrival Recorded').should('be.visible');
        });

        // 6. Reset for next scan
        cy.get('[data-testid="scan-next-btn"]').click();

        // --- DEPARTURE ---
        // 7. Enter Student ID again for Departure
        cy.get('[data-testid="qr-manual-input"]').type(studentId);
        cy.get('[data-testid="qr-submit-btn"]').click();

        // 8. Verify Departure Success
        cy.get('[data-testid="departure-result-card"]').should('be.visible');
        cy.get('[data-testid="departure-result-card"]').within(() => {
            cy.contains(studentId).should('be.visible');
            cy.contains('Departure Confirmed').should('be.visible');
        });
    });

    after(() => {
        // Cleanup test booking using script
        cy.exec('node C:/Users/lasha/Desktop/UniSpot/backend/scratch/cleanup_test_booking.js', { 
            cwd: 'C:/Users/lasha/Desktop/UniSpot/backend' 
        });
    });
});
