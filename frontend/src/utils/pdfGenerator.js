import jsPDF from 'jspdf';

export const generateParkingReceipt = (booking, student, logoSrc) => {
  if (!booking || !student) return;

  // A4 Default 210 x 297
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth() || 210;
  const pageHeight = doc.internal.pageSize.getHeight() || 297;

  // Fill Page Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header Background Deep Blue Section
  doc.setFillColor(15, 37, 104);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Light blue branding bar below header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 45, pageWidth, 5, 'F');

  const finishPDF = (doc) => {
    // Header text - System Name
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('UniSpot Parking', 80, 28);
    
    // Receipt Title
    doc.setFontSize(22);
    doc.setTextColor(15, 37, 104);
    doc.setFont(undefined, 'bold');
    doc.text('Parking Booking Receipt', 20, 75);

    const refId = 'REF-' + Math.floor(100000 + Math.random() * 900000);
    
    // Formatting date nicely
    let bookingDateStr = new Date().toLocaleDateString();
    if (booking.bookingDate) {
      const d = new Date(booking.bookingDate);
      if (!isNaN(d.valueOf())) {
        bookingDateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }

    // Left-side Container Background (Booking Details)
    doc.setDrawColor(220, 230, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 95, 110, 135, 4, 4, 'FD');
    
    // Right-side Container Background (QR Card)
    doc.setDrawColor(220, 230, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(135, 95, 55, 135, 4, 4, 'FD');

    // --- Left Column Content ---
    doc.setFontSize(14);
    doc.setTextColor(15, 37, 104);
    doc.setFont(undefined, 'bold');
    doc.text('Student Details', 28, 110);
    
    doc.setFontSize(11);
    
    let yOffset = 120;
    const addRow = (label, value) => {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(100, 110, 120);
      doc.text(label, 28, yOffset);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(30, 40, 50);
      doc.text(String(value), 62, yOffset);
      yOffset += 9;
    };

    addRow('Name:', student.name || `${student.firstName} ${student.lastName}`);
    addRow('Student ID:', student.studentId);
    addRow('Vehicle Type:', booking.vehicleType || 'N/A');
    addRow('Vehicle No:', booking.vehicleNumber || 'N/A');
    
    yOffset += 5; // Spacing before next section
    doc.setFontSize(14);
    doc.setTextColor(15, 37, 104);
    doc.setFont(undefined, 'bold');
    doc.text('Parking Details', 28, yOffset);
    
    yOffset += 10;
    doc.setFontSize(11);
    addRow('Zone:', booking.zone);
    addRow('Slot No:', booking.slotNumber);
    addRow('Date:', bookingDateStr);
    addRow('Time:', `${booking.arrivalTime} to ${booking.leavingTime}`);

    // --- Right Column (QR Code Card) Content ---
    doc.setFontSize(12);
    doc.setTextColor(15, 37, 104);
    doc.setFont(undefined, 'bold');
    doc.text('Student QR', 151, 111, { align: 'center' });
    
    // QR Code area
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 235, 245);
    // Center the QR image block in the card
    doc.roundedRect(139.5, 125, 46, 46, 3, 3, 'FD');
    
    // Draw actual QR code from student profile
    if (student.qrCode) {
      // student.qrCode data URI prefix implies it goes directly here
      doc.addImage(student.qrCode, 'PNG', 142.5, 128, 40, 40);
    } else {
      // Fallback if no QR
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text('No QR', 162.5, 148, { align: 'center' });
    }

    // QR helper text
    doc.setFontSize(9);
    doc.setTextColor(100, 110, 120);
    doc.setFont(undefined, 'normal');
    doc.text('Scan for student', 162.5, 185, { align: 'center' });
    doc.text('verification', 162.5, 190, { align: 'center' });

    // --- Footer / Status Area ---
    doc.setDrawColor(220, 230, 240);
    doc.setFillColor(250, 252, 255);
    doc.roundedRect(20, 240, 170, 30, 3, 3, 'FD');
    
    // Booking Reference
    doc.setFontSize(10);
    doc.setTextColor(100, 110, 120);
    doc.setFont(undefined, 'bold');
    doc.text('BOOKING REFERENCE', 30, 252);
    doc.setFontSize(14);
    doc.setTextColor(15, 37, 104);
    doc.text(refId, 30, 262);

    // Date Issued
    doc.setFontSize(10);
    doc.setTextColor(100, 110, 120);
    doc.text('DATE ISSUED', 90, 252);
    doc.setFontSize(12);
    doc.setTextColor(60, 70, 80);
    doc.setFont(undefined, 'normal');
    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    doc.text(today, 90, 262);
    
    // Booking Status Box
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(145, 248, 35, 15, 7.5, 7.5, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('ACTIVE', 162.5, 257.5, { align: 'center' });

    // Info Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 155, 160);
    doc.setFont(undefined, 'normal');
    doc.text('This is an automatically generated receipt from UniSpot.', pageWidth / 2, 285, { align: 'center' });

    // Save PDF
    doc.save(`Parking_Receipt_${booking.slotNumber}.pdf`);
  };

  const img = new Image();
  img.src = logoSrc;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    
    const ratio = img.height / img.width;
    const renderWidth = 32;
    const renderHeight = renderWidth * ratio;
    
    const containerPaddingX = 10;
    const containerPaddingY = 7;
    const containerWidth = renderWidth + (containerPaddingX * 2);
    const containerHeight = renderHeight + (containerPaddingY * 2);
    
    const containerX = 20;
    const containerY = (45 - containerHeight) / 2;
    
    // Shadow layer
    doc.setFillColor(10, 25, 75);
    doc.roundedRect(containerX + 1.5, containerY + 1.5, containerWidth, containerHeight, 5, 5, 'F');
    
    // White pill container
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(240, 245, 250);
    doc.roundedRect(containerX, containerY, containerWidth, containerHeight, 5, 5, 'FD');
    
    const logoX = containerX + containerPaddingX;
    const logoY = containerY + containerPaddingY;
    
    doc.addImage(dataUrl, 'PNG', logoX, logoY, renderWidth, renderHeight);
    finishPDF(doc);
  };
  img.onerror = () => {
    finishPDF(doc);
  };
};
