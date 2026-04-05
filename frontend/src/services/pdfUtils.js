import jsPDF from "jspdf";
import "jspdf-autotable";

export function generateWalletStatementPDF(
  transactions,
  user,
  filterLabel = "All Time",
) {
  const doc = new jsPDF();
  const primaryColor = [79, 70, 229]; // Indigo-600
  const secondaryColor = [31, 41, 55]; // Gray-800
  const accentColor = [16, 185, 129]; // Emerald-500

  // Helper for background color
  const setFillColor = (r, g, b) => doc.setFillColor(r, g, b);

  // --- HEADER SECTION ---
  // Background rectangle for branding
  doc.setDrawColor(0);
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 45, "F");

  // Branded Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("FACEPAY", 15, 28);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("The Smartest Way to Pay & Earn", 15, 35);

  // Statement Type & Period (Right aligned)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("WALLET STATEMENT", 200, 20, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${filterLabel}`, 200, 28, { align: "right" });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 200, 35, {
    align: "right",
  });

  // --- USER INFO ---
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Account Holder Details", 15, 60);

  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 231, 235);
  doc.line(15, 62, 195, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${user?.full_name || user?.name || "N/A"}`, 15, 70);
  doc.text(`Email: ${user?.email || "N/A"}`, 15, 76);
  doc.text(`Phone: ${user?.phone || "N/A"}`, 15, 82);

  // --- SUMMARY CARDS ---
  const totalIn = transactions
    .filter((t) => t.type === "credit" || t.type === "deposit")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.type === "debit" || t.type === "withdrawal")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalReward = transactions
    .filter((t) => t.type === "reward")
    .reduce((acc, t) => acc + t.amount, 0);

  // Total In Card
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(15, 95, 55, 25, 3, 3, "F");
  doc.setTextColor(5, 150, 105);
  doc.setFont("helvetica", "bold");
  doc.text("Total Credits", 18, 102);
  doc.setFontSize(14);
  doc.text(`₹${totalIn.toFixed(2)}`, 18, 112);

  // Total Out Card
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(75, 95, 55, 25, 3, 3, "F");
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(10);
  doc.text("Total Debits", 78, 102);
  doc.setFontSize(14);
  doc.text(`₹${totalOut.toFixed(2)}`, 78, 112);

  // Reward Card
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(135, 95, 60, 25, 3, 3, "F");
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(10);
  doc.text("Total Rewards", 138, 102);
  doc.setFontSize(14);
  doc.text(`₹${totalReward.toFixed(2)}`, 138, 112);

  // --- TABLE SECTION ---
  doc.autoTable({
    startY: 135,
    head: [
      [
        "Date & Time",
        "Type",
        "Transaction ID",
        "Description",
        "Status",
        "Amount",
      ],
    ],
    body: transactions.map((t) => [
      new Date(t.created_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      t.type.toUpperCase(),
      t._id?.toString().slice(-8).toUpperCase() || "N/A",
      t.description || "Wallet Transaction",
      t.status.toUpperCase(),
      {
        content: `₹${t.amount.toFixed(2)}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
    ]),
    headStyles: {
      fillColor: [79, 70, 229],
      fontSize: 10,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      5: { cellWidth: 30 },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        if (data.cell.raw === "DEBIT" || data.cell.raw === "WITHDRAWAL")
          doc.setTextColor(220, 38, 38);
        else if (
          data.cell.raw === "CREDIT" ||
          data.cell.raw === "DEPOSIT" ||
          data.cell.raw === "REWARD"
        )
          doc.setTextColor(5, 150, 105);
      }
    },
  });

  // --- FOOTER SECTION ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(
      "This is a computer-generated document. For support, reach out to help@facepay.ai",
      105,
      doc.internal.pageSize.height - 15,
      { align: "center" },
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  doc.save(`FacePay_Statement_${new Date().toISOString().split("T")[0]}.pdf`);
}
