const mongoose = require("mongoose");

// Helper for better transaction_id generation
function generateTransactionId() {
  return (
    "TXN" +
    Date.now().toString(36).toUpperCase() +
    Math.floor(Math.random() * 1000000)
  );
}

const transactionSchema = new mongoose.Schema(
  {
    // ==================== OWNER ====================
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==================== DIRECTION ====================
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    // ==================== FLOW ====================
    // ✅ FIX: required hata diya — addMoney mein flow nahi hota
    flow: {
      type: String,
      enum: ["send", "receive", "request", "add_money", "withdrawal"],
      default: "add_money",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==================== BALANCE SNAPSHOTS ====================
    balance_before: {
      type: Number,
      required: true,
    },
    balance_after: {
      type: Number,
      required: true,
    },

    // ==================== CATEGORY ====================
    category: {
      type: String,
      enum: [
        "Food",
        "Entertainment",
        "Shopping",
        "Transfer",
        "Salary",
        "Reward",
        "Cashback",
        "Utility",
        "Recharge",
        "Bill Payment",
        "Add Money",
        "Withdrawal",
        "Rent",
        "Gift",
        "Travel",
        "Bills",
        "Other",
      ],
      default: "Other",
    },

    // ==================== TITLE & DESCRIPTION ====================
    title: {
      type: String,
      required: true,
    },
    description: String,
    note: {
      type: String,
      default: "",
    },

    // ==================== COUNTERPARTY INFO ====================
    counterparty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recipient: {
      type: String,
      trim: true,
    },
    receiver_upi: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ==================== STATUS & PAYMENT METHOD ====================
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "success",
    },
    payment_method: {
      type: String,
      enum: ["wallet", "upi", "card", "net_banking"],
      default: "wallet",
    },

    // ==================== IDENTIFIERS ====================
    transaction_id: {
      type: String,
      unique: true,
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ==================== REWARDS FIELDS (NEW) ====================
    cashbackEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    isBillSplit: {
      type: Boolean,
      default: false,
    },
    splitWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ==================== METADATA ====================
    metadata: {
      type: Map,
      of: String,
    },

    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ==================== PRE-SAVE HOOK ====================
transactionSchema.pre("save", function (next) {
  // Auto-generate transaction_id if not provided
  if (this.isNew && !this.transaction_id) {
    this.transaction_id = generateTransactionId();
  }
  // Sync transactionId with transaction_id
  if (this.isNew && !this.transactionId) {
    this.transactionId = this.transaction_id;
  }
  // Sync note <-> description
  if (!this.note && this.description) {
    this.note = this.description;
  }
  if (!this.description && this.note) {
    this.description = this.note;
  }
  // ✅ FIX: flow auto-set based on type agar nahi diya
  if (!this.flow) {
    if (this.category === "Add Money") this.flow = "add_money";
    else if (this.category === "Withdrawal") this.flow = "withdrawal";
    else if (this.type === "credit") this.flow = "receive";
    else this.flow = "send";
  }
  next();
});

// ==================== INDEXES ====================
// ✅ Dashboard query ke liye — sabse important
transactionSchema.index({ user_id: 1, createdAt: -1 });
// ✅ Monthly stats ke liye
transactionSchema.index({ user_id: 1, type: 1, createdAt: -1 });
// ✅ Transaction lookup ke liye
transactionSchema.index({ transaction_id: 1 }, { unique: true });
transactionSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
// ✅ Counterparty queries ke liye
transactionSchema.index({ counterparty_id: 1 });
// ✅ Status filter ke liye
transactionSchema.index({ status: 1 });
// ✅ Optional: index for splitWith if needed
transactionSchema.index({ splitWith: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
