import jsPDF from "jspdf";
import "jspdf-autotable";

export function generateWalletStatementPDF(
  transactions,
  user,
  filterLabel = "All Time",
) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Wallet Statement", 14, 18);
  doc.setFontSize(12);
  doc.text(`User: ${user?.full_name || user?.name || "-"}`, 14, 28);
  doc.text(`Email: ${user?.email || "-"}`, 14, 36);
  doc.text(`Period: ${filterLabel}`, 14, 44);
  doc.autoTable({
    startY: 52,
    head: [["Date", "Type", "Amount", "Status", "Description"]],
    body: transactions.map((t) => [
      new Date(t.created_at).toLocaleString(),
      t.type,
      t.amount,
      t.status,
      t.description || "",
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 70, 229] },
    alternateRowStyles: { fillColor: [240, 240, 255] },
  });
  doc.save("wallet_statement.pdf");
}
