const GoogleSpreadSheet = require('google-spreadsheet');
const googleCreds = require('../google-credentials.json');

/**
 * SprintLog class wrapper around DTR's Sprint Logs for easy access to specific pieces of data.
 */
class SprintLog {
  constructor(sprintSpreadsheetId) {
    // setup doc
    this.sprintDoc = new GoogleSpreadSheet(sprintSpreadsheetId);

  }

  authorizeWithGoogle() {
    return new Promise((resolve, reject) => {
      this.sprintDoc.useServiceAccountAuth(googleCreds, (err, data) => {
        if (err === undefined || err === null) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }

  getInfoAndWorksheets() {
    return new Promise((resolve, reject) => {
      this.sprintDoc.getInfo((err, data) => {
        if (err === undefined || err === null) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }

  getCellsForSheet(worksheetId, opts) {
    return new Promise((resolve, reject) => {
      this.sprintDoc.getCells(worksheetId, opts, (err, data) => {
        if (err === undefined || err === null) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }

  getRowsForSheet(worksheetId, opts) {
    return new Promise((resolve, reject) => {
      this.sprintDoc.getRows(worksheetId, opts, (err, data) => {
        if (err === undefined || err === null) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }
}

module.exports = SprintLog;