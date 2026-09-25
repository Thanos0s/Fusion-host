/**
 * FusionHost Feedback & Payment Tracker — Google Apps Script
 * 
 * HOW TO USE:
 * 1. Open your Google Sheet
 * 2. Click Extensions → Apps Script
 * 3. Delete all existing code, paste this entire script
 * 4. Click Save (💾), then click ► Run → "setupSheet"
 * 5. Grant permissions when prompted
 * 6. Done! Check your sheet.
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SHEET_NAME  = 'Feedback';   // Change if your tab has a different name
const SAMPLE_ROWS = 15;           // How many demo rows to generate
// ─────────────────────────────────────────────────────────────────────────────

function setupSheet() {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  let sheet  = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  // ── 1. Write headers ──────────────────────────────────────────────────────
  const headers = [
    'Timestamp',
    'Name',
    'Email',
    'Wallet Address',
    'Transaction Hash',
    'Feedback',
    'Source Form',
  ];

  sheet.clearContents();
  sheet.clearFormats();

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);

  // Header styling
  headerRange
    .setBackground('#1a1a2e')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setBorder(true, true, true, true, false, false, '#444488',
               SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // ── 2. Generate sample rows with random timestamps ────────────────────────
  const rows = [];
  for (let i = 0; i < SAMPLE_ROWS; i++) {
    rows.push([
      randomTimestamp(),
      randomName(),
      randomEmail(),
      randomWallet(),
      randomTxHash(),
      randomFeedback(),
      randomForm(),
    ]);
  }
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

  // ── 3. Format columns ─────────────────────────────────────────────────────
  // Timestamp column → readable date format
  sheet.getRange(2, 1, SAMPLE_ROWS, 1)
    .setNumberFormat('yyyy-mm-dd hh:mm:ss');

  // Wallet + TxHash → monospace font
  sheet.getRange(2, 4, SAMPLE_ROWS, 2)
    .setFontFamily('Courier New')
    .setFontSize(9);

  // Feedback → wrap text
  sheet.getRange(2, 6, SAMPLE_ROWS, 1)
    .setWrap(true);

  // ── 4. Alternate row colours ──────────────────────────────────────────────
  for (let r = 2; r <= SAMPLE_ROWS + 1; r++) {
    const bg = (r % 2 === 0) ? '#f0f0f8' : '#ffffff';
    sheet.getRange(r, 1, 1, headers.length).setBackground(bg);
  }

  // ── 5. Auto-resize all columns ────────────────────────────────────────────
  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
  // Ensure Feedback column is wide enough
  sheet.setColumnWidth(6, 320);

  // ── 6. Freeze header row + add filter ─────────────────────────────────────
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, SAMPLE_ROWS + 1, headers.length).createFilter();

  // ── 7. Add data validation for Source Form column ─────────────────────────
  const formOptions = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'FusionHost Beta Form',
      'Discord Feedback Form',
      'Twitter Campaign Form',
      'Email Invite Form',
      'Product Hunt Form',
    ], true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 7, SAMPLE_ROWS, 1).setDataValidation(formOptions);

  SpreadsheetApp.getUi().alert(
    '✅ Sheet ready!\n\n' +
    SAMPLE_ROWS + ' sample rows added with random timestamps.\n\n' +
    'Columns: Timestamp | Name | Email | Wallet Address | Transaction Hash | Feedback | Source Form'
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function randomTimestamp() {
  // Random date between 1 Jan 2025 and today
  const start = new Date('2025-01-01').getTime();
  const end   = Date.now();
  return new Date(start + Math.random() * (end - start));
}

function randomName() {
  const first = ['Aarav','Priya','Rohan','Sneha','Kiran','Ananya','Vikram',
                  'Divya','Arjun','Meera','Dev','Sana','Neel','Isha','Raj'];
  const last  = ['Sharma','Patel','Singh','Mehta','Gupta','Joshi','Nair',
                  'Kumar','Reddy','Iyer','Shah','Malhotra','Verma','Pillai'];
  return pick(first) + ' ' + pick(last);
}

function randomEmail() {
  const domains = ['gmail.com','yahoo.com','outlook.com','proton.me','hey.com'];
  const name = randomName().toLowerCase().replace(' ', '.').replace(/[^a-z.]/g,'');
  return name + Math.floor(Math.random() * 999) + '@' + pick(domains);
}

function randomWallet() {
  // Ethereum-style 0x address
  const hex = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
}

function randomTxHash() {
  const hex = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += hex[Math.floor(Math.random() * 16)];
  return hash;
}

function randomFeedback() {
  const feedbacks = [
    'Deployment was super fast! Loved the zero-config experience.',
    'The MCP server integration with Claude is a game-changer for my workflow.',
    'Would love to see multi-region support in the future.',
    'Got my app live in under 2 minutes. Insane product!',
    'PostgreSQL auto-provisioning saved me hours of setup time.',
    'The dashboard UI is clean and very intuitive.',
    'Rollback feature worked perfectly when my deploy failed.',
    'Please add support for Redis caching — that would be huge.',
    'Best PaaS experience I\'ve had. Will recommend to my team.',
    'Pricing is very fair for what you get. Pro plan is a steal.',
    'The instant rollback feature is what sold me on this platform.',
    'Really impressed with how it detected my framework automatically.',
    'Would appreciate a CLI tool in addition to the MCP server.',
    'Scale-to-zero is perfect for my hobby projects — no wasted spend!',
    'The limitations page was very honest and helped me decide quickly.',
  ];
  return pick(feedbacks);
}

function randomForm() {
  const forms = [
    'FusionHost Beta Form',
    'Discord Feedback Form',
    'Twitter Campaign Form',
    'Email Invite Form',
    'Product Hunt Form',
  ];
  return pick(forms);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── FORM SUBMIT HANDLER ─────────────────────────────────────────────────────
/**
 * If you connect a Google Form to this sheet, set it as the
 * "On form submit" trigger to auto-log each real submission.
 */
function onFormSubmit(e) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const resp  = e.namedValues;

  sheet.appendRow([
    new Date(),                                           // Timestamp (real time)
    (resp['Full Name']          || [''])[0],
    (resp['Email Address']      || [''])[0],
    (resp['Wallet Address']     || [''])[0],
    (resp['Transaction Hash']   || [''])[0],
    (resp['Feedback']           || [''])[0],
    (resp['Source Form']        || ['Direct Form'])[0],
  ]);
}
