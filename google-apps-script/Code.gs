const SPREADSHEET_ID = '1_1Z2_-IvotOsDF1JIs-Zaz2D6vzHl8rIqSFeyQxnfmM';
const PASSWORD_ITERATIONS = 30000;

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents || '{}');

    let result;
    switch (request.action) {
      case 'register':
        result = registerAccount(request.username, request.password);
        break;
      case 'login':
        result = loginAccount(request.username, request.password);
        break;
      case 'leaderboard':
        result = { entries: getLeaderboard() };
        break;
      case 'session':
        result = { username: getSessionUsername(request.sessionToken) };
        break;
      case 'logout':
        removeSession(request.sessionToken);
        result = {};
        break;
      case 'addScore':
        result = addScore(request.sessionToken, request.score);
        break;
      default:
        throw new Error('UNKNOWN_ACTION');
    }

    return jsonResponse(Object.assign({ ok: true }, result));
  } catch (error) {
    const message = error && error.message ? error.message : 'INTERNAL_ERROR';
    return jsonResponse({ ok: false, error: message });
  }
}

function constantTimeEquals(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function getAccountSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets()[0];
  if (!sheet) throw new Error('SHEET_NOT_FOUND');
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 4).setValues([['index', 'username', 'password hash', 'score']]);
  }
  return sheet;
}

function getAccountRows(sheet) {
  const lastRow = sheet.getLastRow();
  return lastRow < 2 ? [] : sheet.getRange(2, 1, lastRow - 1, 4).getValues();
}

function findAccount(rows, username) {
  const normalized = String(username || '').trim().toLowerCase();
  return rows.findIndex(function (row) {
    return String(row[1] || '').trim().toLowerCase() === normalized;
  });
}

function registerAccount(username, password) {
  username = String(username || '').trim();
  password = String(password || '');
  if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) throw new Error('INVALID_USERNAME');
  if (password.length < 8 || password.length > 128) throw new Error('INVALID_PASSWORD');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('TRY_AGAIN');
  try {
    const sheet = getAccountSheet();
    const rows = getAccountRows(sheet);
    if (findAccount(rows, username) >= 0) throw new Error('USERNAME_TAKEN');
    const nextIndex = rows.reduce(function (maxIndex, row) {
      return Math.max(maxIndex, Number(row[0]) || 0);
    }, 0) + 1;
    const passwordHash = hashPassword(password);
    sheet.appendRow([nextIndex, username, passwordHash, 0]);
  } finally {
    lock.releaseLock();
  }
  return createSession(username);
}

function loginAccount(username, password) {
  username = String(username || '').trim();
  password = String(password || '');
  const rows = getAccountRows(getAccountSheet());
  const rowIndex = findAccount(rows, username);
  if (rowIndex < 0 || !verifyPassword(password, String(rows[rowIndex][2] || ''))) {
    throw new Error('INVALID_CREDENTIALS');
  }
  return createSession(String(rows[rowIndex][1]));
}

function createSession(username) {
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put('session_' + token, username, 21600);
  return { username: username, sessionToken: token };
}

function getSessionUsername(sessionToken) {
  if (typeof sessionToken !== 'string' || !/^[a-f0-9]{64}$/i.test(sessionToken)) return '';
  return CacheService.getScriptCache().get('session_' + sessionToken) || '';
}

function removeSession(sessionToken) {
  if (typeof sessionToken === 'string' && /^[a-f0-9]{64}$/i.test(sessionToken)) {
    CacheService.getScriptCache().remove('session_' + sessionToken);
  }
}

function getLeaderboard() {
  const entries = getAccountRows(getAccountSheet())
    .filter(function (row) { return String(row[1] || '').trim() !== ''; })
    .map(function (row) {
      return { username: String(row[1]).trim(), score: Number(row[3]) || 0 };
    })
    .sort(function (left, right) {
      return right.score - left.score || left.username.localeCompare(right.username);
    });

  return entries.map(function (entry, index) {
    return { rank: index + 1, username: entry.username, score: entry.score };
  });
}

function addScore(sessionToken, score) {
  const username = getSessionUsername(sessionToken);
  if (!username) throw new Error('INVALID_SESSION');
  score = Number(score);
  if (!Number.isSafeInteger(score) || score < 1 || score > 10000000) throw new Error('INVALID_SCORE');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('TRY_AGAIN');
  try {
    const sheet = getAccountSheet();
    const rows = getAccountRows(sheet);
    const rowIndex = findAccount(rows, username);
    if (rowIndex < 0) throw new Error('ACCOUNT_NOT_FOUND');
    const sheetRow = rowIndex + 2;
    const totalScore = (Number(rows[rowIndex][3]) || 0) + score;
    sheet.getRange(sheetRow, 4).setValue(totalScore);
    return { username: String(rows[rowIndex][1]), score: totalScore };
  } finally {
    lock.releaseLock();
  }
}

function hashPassword(password) {
  const salt = Utilities.getUuid().replace(/-/g, '');
  const passwordBytes = Utilities.newBlob(password).getBytes();
  const saltBytes = Utilities.newBlob(salt).getBytes();
  const firstBlock = saltBytes.concat([0, 0, 0, 1]);
  let current = Utilities.computeHmacSha256Signature(firstBlock, passwordBytes);
  const derivedKey = current.map(function (byte) { return byte & 255; });

  for (let iteration = 1; iteration < PASSWORD_ITERATIONS; iteration++) {
    current = Utilities.computeHmacSha256Signature(current, passwordBytes);
    for (let index = 0; index < derivedKey.length; index++) {
      derivedKey[index] ^= current[index] & 255;
    }
  }

  return 'pbkdf2-sha256$' + PASSWORD_ITERATIONS + '$' + salt + '$' + bytesToHex(derivedKey);
}

function verifyPassword(password, storedHash) {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256' || Number(parts[1]) !== PASSWORD_ITERATIONS) {
    return false;
  }
  const candidate = hashPasswordWithSalt(String(password), parts[2]);
  return constantTimeEquals(candidate, parts[3]);
}

function hashPasswordWithSalt(password, salt) {
  const passwordBytes = Utilities.newBlob(password).getBytes();
  const firstBlock = Utilities.newBlob(salt).getBytes().concat([0, 0, 0, 1]);
  let current = Utilities.computeHmacSha256Signature(firstBlock, passwordBytes);
  const derivedKey = current.map(function (byte) { return byte & 255; });

  for (let iteration = 1; iteration < PASSWORD_ITERATIONS; iteration++) {
    current = Utilities.computeHmacSha256Signature(current, passwordBytes);
    for (let index = 0; index < derivedKey.length; index++) {
      derivedKey[index] ^= current[index] & 255;
    }
  }
  return bytesToHex(derivedKey);
}

function bytesToHex(bytes) {
  return bytes.map(function (byte) {
    return (byte & 255).toString(16).padStart(2, '0');
  }).join('');
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}