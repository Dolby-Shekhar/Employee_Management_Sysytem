const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  response: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'sent', 'read', 'actioned'], default: 'draft' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);
