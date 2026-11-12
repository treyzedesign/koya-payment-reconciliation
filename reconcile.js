// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");
 
let total = 0;
let count = 0;
 
// latest attempt per txn_id
const latest = {};
 
const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);
for (const line of lines) {
  let event;
  try {
    event = JSON.parse(line);
  } catch (e) {
    continue; // unreadable line
  }
  if (!event.txn_id) continue;
  const prev = latest[event.txn_id];
  if (!prev || event.ts > prev.ts) {
    latest[event.txn_id] = event;
  }
}
 
for (const event of Object.values(latest)) {
  if (event.status === "success") {
    total += Number(String(event.amount).replace(/,/g, ""));
    count += 1;
  }
}
 
const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);
 
if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
