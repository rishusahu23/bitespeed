const express = require("express");
const mongoose = require("mongoose");
const Contact = require("./../models/contact");

const router = express.Router();

const handleIdentify = async (req, res) => {
  try {
    let record = [],
      record1 = [],
      record2 = [];
    let result = {};
    if (req.body.email == null && req.body.phoneNumber == null) {
      return res.status(400).json({ error: "Bad Request" });
    }
    if (req.body.email != null && req.body.phoneNumber != null) {
      record = await Contact.find({
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
      });
    }
    if (req.body.email != null) {
      record1 = await Contact.find({
        email: req.body.email,
      });
    }
    if (req.body.phoneNumber != null) {
      record2 = await Contact.find({
        phoneNumber: req.body.phoneNumber,
      });
    }

    if (record?.length == 0 && record1?.length == 0 && record2?.length == 0) {
      const newContact = await Contact.create(req.body);
      result = {
        primaryContactId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phoneNumber],
        secondaryContactIds: [],
      };
    } else if (record?.length != 0) {
      const temp = await Contact.find({
        $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
      }).sort({ createdAt: 1 });
      const primary = [temp[0]];
      const secondary = temp.filter((c) => c.id != primary[0].id);
      emails = [primary[0].email];
      for (let i = 0; i < secondary.length; i++) {
        emails.push(secondary[i].email);
      }
      phoneNumbers = [primary[0].phoneNumber];
      for (let i = 0; i < secondary.length; i++) {
        phoneNumbers.push(secondary[i].phoneNumber);
      }
      secondaryContactIds = [];
      for (let i = 0; i < secondary.length; i++) {
        secondaryContactIds.push(secondary[i].id);
      }
      result = {
        primaryContactId: primary[0].id,
        emails: emails,
        phoneNumbers: phoneNumbers,
        secondaryContactIds: secondaryContactIds,
      };
    } else if (record2?.length != 0 && record1?.length != 0) {
      let temp = await Contact.find({
        $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
      }).sort({ createdAt: 1 });
      let primary = [temp[0]];
      let _id = primary[0].id;

      await Contact.create({
        ...req.body,
        linkPrecedence: "secondary",
        linkedId: _id,
      });

      const updateOptions = {
        $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
        _id: { $ne: new mongoose.Types.ObjectId(_id) },
      };

      const updateFields = {
        linkPrecedence: "secondary",
        linkedId: _id,
        updatedAt: new Date(),
      };

      await Contact.updateMany(updateOptions, updateFields);

      temp = await Contact.find({
        $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
      });
      secondary = temp.filter((c) => c.linkPrecedence == "secondary");

      phoneNumbers = [primary[0].phoneNumber];
      for (let i = 0; i < secondary.length; i++) {
        phoneNumbers.push(secondary[i].phoneNumber);
      }
      emails = [primary[0].email];
      for (let i = 0; i < secondary.length; i++) {
        emails.push(secondary[i].email);
      }
      secondaryContactIds = [];
      for (let i = 0; i < secondary.length; i++) {
        secondaryContactIds.push(secondary[i].id);
      }
      result = {
        primaryContactId: _id,
        emails: emails,
        phoneNumbers: phoneNumbers,
        secondaryContactIds: secondaryContactIds,
      };
    } else if (record1?.length != 0) {
      let temp = await Contact.find({
        $or: [{ email: req.body.email }],
      }).sort({ createdAt: 1 });
      primary = [temp[0]];
      if (req.body.phoneNumber) {
        await Contact.create({
          ...req.body,
          linkPrecedence: "secondary",
          linkedId: primary[0].id,
        });
        temp = await Contact.find({
          $or: [{ phoneNumber: req.body.phoneNumber }],
        });
      }
      temp = await Contact.find({
        $or: [{ email: req.body.email }],
      }).sort({ createdAt: 1 });
      primary = [temp[0]];
      secondary = temp.filter((c) => c.id != primary[0].id);
      phoneNumbers = [primary[0].phoneNumber];
      for (let i = 0; i < secondary.length; i++) {
        phoneNumbers.push(secondary[i].phoneNumber);
      }
      emails = [primary[0].email];
      for (let i = 0; i < secondary.length; i++) {
        emails.push(secondary[i].email);
      }
      secondaryContactIds = [];
      for (let i = 0; i < secondary.length; i++) {
        secondaryContactIds.push(secondary[i].id);
      }
      result = {
        primaryContactId: primary[0].id,
        emails: emails,
        phoneNumbers: phoneNumbers,
        secondaryContactIds: secondaryContactIds,
      };
    } else if (record2?.length != 0) {
      let temp = await Contact.find({
        $or: [{ phoneNumber: req.body.phoneNumber }],
      }).sort({ createdAt: 1 });
      primary = [temp[0]];
      if (req.body.email) {
        await Contact.create({
          ...req.body,
          linkPrecedence: "secondary",
          linkedId: primary[0].id,
        });
        temp = await Contact.find({
          $or: [{ phoneNumber: req.body.email }],
        });
      }
      temp = await Contact.find({
        $or: [{ phoneNumber: req.body.phoneNumber }],
      }).sort({ createdAt: 1 });
      primary = [temp[0]];
      secondary = temp.filter((c) => c.id != primary[0].id);
      phoneNumbers = [primary[0].phoneNumber];
      for (let i = 0; i < secondary.length; i++) {
        phoneNumbers.push(secondary[i].phoneNumber);
      }
      emails = [primary[0].email];
      for (let i = 0; i < secondary.length; i++) {
        emails.push(secondary[i].email);
      }
      secondaryContactIds = [];
      for (let i = 0; i < secondary.length; i++) {
        secondaryContactIds.push(secondary[i].id);
      }
      result = {
        primaryContactId: primary[0].id,
        emails: emails,
        phoneNumbers: phoneNumbers,
        secondaryContactIds: secondaryContactIds,
      };
    }
    result.emails = [
      ...new Set(result.emails?.filter((email) => email != null)),
    ];
    result.phoneNumbers = [
      ...new Set(
        result.phoneNumbers?.filter((phoneNumber) => phoneNumber != null)
      ),
    ];
    result.secondaryContactIds = [...new Set(result.secondaryContactIds)];
    res.status(201).json({
      status: "success",
      data: {
        contact: result,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
router.route("/identify").post(handleIdentify);

module.exports = router;
