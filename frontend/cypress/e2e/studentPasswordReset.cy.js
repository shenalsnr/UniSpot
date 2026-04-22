describe('Student Password Reset (Forgot Password)', () => {
    const student = {
        id: 'IT12345678',
        phone: '0773486283',
        newPassword: '12345',
        oldPassword: 'lashan2'
    };

    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should successfully reset the student password using OTP', () => {
        // 1. Request OTP
        cy.visit('/student-forgot-password');
        cy.get('[data-testid="forgot-student-id-input"]').type(student.id);
        cy.get('[data-testid="forgot-phone-input"]').type(student.phone);
        cy.get('[data-testid="send-otp-button"]').click();

        // Verify Step 2 is active
        cy.get('[data-testid="forgot-otp-input"]').should('be.visible');

        // 2. Retrieve OTP from DB via standalone script
        // We use cy.exec because mongoose is a backend dependency
        cy.exec(`node ../backend/scratch/get_otp.js ${student.id}`).then((result) => {
            // Regex to find exactly 6 digits to be safe from any other output
            const matches = result.stdout.match(/\d{6}/);
            expect(matches).to.not.be.null;
            const otp = matches[0];
            cy.log(`Retrieved OTP: ${otp}`);

            // 3. Reset Password
            cy.get('[data-testid="forgot-otp-input"]').type(otp);
            cy.get('[data-testid="forgot-new-password-input"]').type(student.newPassword);
            cy.get('[data-testid="reset-password-button"]').click();

            // 4. Verify Redirection to Dashboard (implies reset worked and logged in)
            cy.url({ timeout: 15000 }).should('include', '/student-dashboard');
        });
    });

    it('should verify the new password on login page', () => {
        // 1. Logout if logged in
        cy.visit('/student-dashboard');
        cy.clearLocalStorage();
        
        // 2. Try login with NEW password
        cy.visit('/student-login');
        cy.get('[data-testid="student-id"]', { timeout: 10000 }).type(student.id);
        cy.get('[data-testid="password"]').type(student.newPassword);
        cy.get('[data-testid="login-btn"]').click();

        // 3. Verify success
        cy.url().should('include', '/student-dashboard');
    });

    after(() => {
        // Optional: Reset password back to lashan2 so environment is unchanged
        // Actually, I'll leave it at 12345 as per user request to "test for that"
    });
});
