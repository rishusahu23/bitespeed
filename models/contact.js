const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  linkedId: {
    type: String,
  },
  linkPrecedence: {
    type: String,
    enum: ["secondary", "primary"],
    default: "primary",
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  deletedAt: {
    type: Date,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
