export async function sendWalletStatementEmail(
  email,
  transactions,
  user,
  filterLabel = "All Time",
) {
  // This is a placeholder. In production, call your backend API to send the email.
  // Example POST to /api/wallet/send-statement
  const res = await fetch("http://localhost:5000/api/wallet/send-statement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, transactions, user, filterLabel }),
  });
  const data = await res.json();
  return data;
}
