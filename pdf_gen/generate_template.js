const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF();

// 1. Blue Header Bar
doc.setFillColor(30, 58, 138); // Dark Blue
doc.rect(0, 0, 210, 40, 'F');

// 2. White Logo Box
doc.setFillColor(255, 255, 255);
doc.roundedRect(20, 5, 50, 48, 5, 5, 'F');

// 3. Header Text
doc.setFont("helvetica", "bold");
doc.setFontSize(26);
doc.setTextColor(255, 255, 255);
doc.text("UniSpot Locker", 80, 25);

// 4. Main Page Title
doc.setFontSize(22);
doc.setTextColor(30, 58, 138);
doc.text("Locker Booking Receipt", 20, 75);

// 5. Left Card (Student & Locker Details)
doc.setDrawColor(240, 240, 240);
doc.setFillColor(248, 250, 252); // Light Gray-Blue
doc.roundedRect(20, 90, 100, 110, 5, 5, 'FD');

// Section Title
doc.setFontSize(14);
doc.setTextColor(71, 85, 105);
doc.text("Student Details", 28, 105);

// Labels
doc.setFontSize(10);
doc.setTextColor(148, 163, 184);
const labelsLeft = ["Name:", "Student ID:", "Faculty:", "", "Locker No:", "Location:", "Date:", "Time:"];
labelsLeft.forEach((label, i) => {
    if (label) doc.text(label, 28, 115 + (i * 10));
});

// 6. Right Card (QR Code)
doc.roundedRect(125, 90, 65, 110, 5, 5, 'FD');
doc.setFontSize(14);
doc.setTextColor(71, 85, 105);
doc.text("Student QR", 132, 105);

// QR Placeholder Box
doc.setFillColor(255, 255, 255);
doc.roundedRect(132, 115, 51, 51, 3, 3, 'F');
doc.setFontSize(8);
doc.setTextColor(148, 163, 184);
doc.text("Scan for student", 143, 175);
doc.text("verification", 148, 180);

// 7. Bottom Card (Reference & Status)
doc.setFillColor(248, 250, 252);
doc.roundedRect(20, 210, 170, 35, 5, 5, 'FD');

doc.setFontSize(10);
doc.text("BOOKING REFERENCE", 28, 222);
doc.text("DATE ISSUED", 85, 222);

// Status Placeholder Box
doc.setFillColor(220, 252, 231); // Light Green
doc.roundedRect(145, 218, 35, 18, 5, 5, 'F');
doc.setFontSize(11);
doc.setTextColor(21, 128, 61); // Dark Green
doc.text("ACTIVE", 154, 230);

// 8. Footer
doc.setFontSize(8);
doc.setTextColor(148, 163, 184);
doc.text("This is an automatically generated receipt from UniSpot.", 65, 260);

// Save File
const templateBuffer = doc.output('arraybuffer');
fs.writeFileSync(path.join(__dirname, '..', 'backend', 'uploads', 'templates', 'locker_receipt_template.pdf'), Buffer.from(templateBuffer));

console.log("Template generated successfully at backend/uploads/templates/locker_receipt_template.pdf");
