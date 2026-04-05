export async function sendWalletStatementEmail(
  email,
  transactions,
  user,
  filterLabel = "All Time",
) {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/wallet/send-statement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, transactions, user, filterLabel }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to send email");
  }

  const data = await res.json();
  return data;
}
