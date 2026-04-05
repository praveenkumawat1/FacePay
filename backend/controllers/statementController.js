const User = require("../models/User");
const Transaction = require("../models/Transaction");
const nodemailer = require("nodemailer");

/**
 * Helper to create transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
  });
}

/**
 * Sends a wallet statement via email
 */
exports.sendStatementEmail = async (req, res) => {
  try {
    const { email, transactions, filterLabel } = req.body;
    const userId = req.userId || req.user?.user_id || req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ message: "Email service not configured" });
    }

    const transporter = createTransporter();

    // Grouping transactions for a summary
    const totalIn = transactions
      .filter((t) => t.type === "credit" || t.type === "deposit")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalOut = transactions
      .filter((t) => t.type === "debit" || t.type === "withdrawal")
      .reduce((acc, t) => acc + t.amount, 0);

    const transactionRows = transactions
      .map(
        (t) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">${new Date(t.created_at).toLocaleDateString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">${t.type.toUpperCase()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">${t.description || "Wallet Transaction"}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: bold; color: ${t.type === "debit" ? "#ef4444" : "#10b981"};">
          ₹${t.amount.toFixed(2)}
        </td>
      </tr>
    `,
      )
      .join("");

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 32px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">FACEPAY</h1>
          <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Official Wallet Statement</p>
        </div>
        
        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
            <div>
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Account Holder</p>
              <h3 style="margin: 4px 0; color: #111827;">${user.full_name || user.name}</h3>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">${user.email}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Reporting Period</p>
              <h3 style="margin: 4px 0; color: #4f46e5;">${filterLabel}</h3>
            </div>
          </div>

          <!-- Summary Highlights -->
          <div style="display: flex; gap: 16px; margin-bottom: 32px;">
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; flex: 1; text-align: center;">
              <p style="margin: 0; color: #166534; font-size: 11px; text-transform: uppercase; font-weight: bold;">Money In</p>
              <p style="margin: 4px 0 0; color: #15803d; font-size: 18px; font-weight: bold;">₹${totalIn.toFixed(2)}</p>
            </div>
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; flex: 1; text-align: center;">
              <p style="margin: 0; color: #991b1b; font-size: 11px; text-transform: uppercase; font-weight: bold;">Money Out</p>
              <p style="margin: 4px 0 0; color: #b91c1c; font-size: 18px; font-weight: bold;">₹${totalOut.toFixed(2)}</p>
            </div>
          </div>

          <h4 style="margin: 0 0 16px; color: #111827; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Recent Activity</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #f9fafb; text-align: left;">
                <th style="padding: 12px; color: #374151;">Date</th>
                <th style="padding: 12px; color: #374151;">Type</th>
                <th style="padding: 12px; color: #374151;">Description</th>
                <th style="padding: 12px; color: #374151; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactionRows}
            </tbody>
          </table>
        </div>

        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">This is an automated financial summary from FacePay AI.</p>
          <p style="margin: 4px 0 0; color: #9ca3af; font-size: 12px;">Need help? Contact <a href="mailto:support@facepay.ai" style="color: #4f46e5; text-decoration: none;">support@facepay.ai</a></p>
          <div style="margin-top: 16px;">
            <span style="display: inline-block; width: 8px; height: 8px; background-color: #4f46e5; border-radius: 50%; margin: 0 4px;"></span>
            <span style="display: inline-block; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; margin: 0 4px;"></span>
            <span style="display: inline-block; width: 8px; height: 8px; background-color: #3b82f6; border-radius: 50%; margin: 0 4px;"></span>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"FacePay Statements" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your FacePay Statement: ${filterLabel}`,
      html: htmlContent,
    });

    res.json({ message: "Statement sent successfully" });
  } catch (error) {
    console.error("Statement email error:", error);
    res.status(500).json({
      message: "Failed to send statement email",
      error: error.message,
    });
  }
};
