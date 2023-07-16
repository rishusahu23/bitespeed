const mysql = require("mysql");
const express = require("express");
const e = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Rishu23@",
  database: "bitespeed",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected");
});

app.get("/", (req, res) => {
  res.send("Please use the /identify api to create on enquire");
});

app.post("/identify", (req, res) => {
  console.log(req.body);

  const query = "select * from contacts where email = ? OR phoneNumber = ?";
  db.query(
    query,
    [req.body.email, req.body.phoneNumber],
    (err, results, fields) => {
      if (err) {
        console.error("err1", err);
        throw err;
      }
      const emails = [];
      if (results.length > 0) {
        const query2 =
          "select * from contacts where (email = ? OR phoneNumber = ?) and linkPrecedence = ?";
        db.query(
          query2,
          [req.body.email, req.body.phoneNumber, "primary"],
          (err, results2, fields) => {
            if (err) {
              console.error("err2", err);
              throw err;
            }
            console.log("results2", results2);
            emails.push(results2[0].email);
            db.query(
              "INSERT INTO contacts (email, phoneNumber,linkPrecedence,linkedId) VALUES (?,?,?,?)",
              [
                req.body.email,
                req.body.phoneNumber,
                "secondary",
                results2[0].id,
              ],
              (err, res3, fields) => {
                if (err) {
                  console.error(err);
                  throw err;
                }
              }
            );
            const query3 =
              "select * from contacts where (email = ? OR phoneNumber = ?) and linkPrecedence = ?";
            db.query(
              query3,
              [req.body.email, req.body.phoneNumber, "secondary"],
              (err, results3, fields) => {
                if (err) {
                  console.error(err);
                  throw err;
                }
                console.log("results3", results3);
                // for (let i = 0; i < results3.length; i++) {
                //   emails.push(results3[i].email);
                // }
              }
            );

            res.status(200).json({
              success: true,
              contact: {
                primaryContatctId: results2[0].id,
                emails: emails,
                phoneNumber: [req.body.phoneNumber],
                secondaryContatctId: [],
              },
            });
          }
        );
      } else {
        db.query(
          "INSERT INTO contacts (email, phoneNumber,linkPrecedence) VALUES (?,?,?)",
          [req.body.email, req.body.phoneNumber, "primary"],
          (err, results, fields) => {
            if (err) {
              console.error(err);
              throw err;
            }
            res.status(200).json({
              success: true,
              contact: {
                primaryContatctId: req.body.phoneNumber,
                emails: [req.body.email],
                phoneNumber: [req.body.phoneNumber],
                secondaryContatctId: [],
              },
            });
            return;
          }
        );
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
