// Scheduler
//code.gs

// ============ GOOGLE APPS SCRIPT - COMPLETE SOLUTION ============

// Configuration
const HISTORY_RETENTION_DAYS = 30; // Keep 30 days of history
const CURRENT_SHEET_NAME = 'Current_Schedule';
const HISTORY_SHEET_NAME = 'Schedule_History';
const TAGS_SHEET_NAME = 'Tags_Master';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Check if this is a request for yesterday's data
    if (data.action === 'getYesterday') {
      return getYesterdaySchedule(data.date);
    }

    // Check if this is a request for a specific date's data
    if (data.action === 'getScheduleForDate') {
      return getScheduleForDate(data.date);
    }

    // Check if this is a request for current state (tags + today's schedule)
    if (data.action === 'getCurrentState') {
      return getCurrentState();
    }

    // Otherwise, it's a save operation
    return saveSchedule(data);

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Serve the HTML web app interface
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  } catch (error) {
    console.error('Error in doGet:', error);
    // Fallback: return basic HTML with error message
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Crew Scheduler Error</title></head>
        <body>
          <h1>Error Loading Scheduler</h1>
          <p>Error: ${error.toString()}</p>
          <p>Please check that the 'index' HTML file exists in your Google Apps Script project.</p>
        </body>
      </html>
    `;
    return HtmlService.createHtmlOutput(html);
  }
}

function saveSchedule(data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Ensure sheets exist
  let currentSheet = spreadsheet.getSheetByName(CURRENT_SHEET_NAME);
  let historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);
  let tagsSheet = spreadsheet.getSheetByName(TAGS_SHEET_NAME);

  // Create sheets if they don't exist
  if (!currentSheet) {
    currentSheet = spreadsheet.insertSheet(CURRENT_SHEET_NAME);
    setupSheet(currentSheet);
  }

  if (!historySheet) {
    historySheet = spreadsheet.insertSheet(HISTORY_SHEET_NAME);
    setupSheet(historySheet);
  }

  if (!tagsSheet) {
    tagsSheet = spreadsheet.insertSheet(TAGS_SHEET_NAME);
    setupTagsSheet(tagsSheet);
  }

  // Save current tags state if provided
  if (data.tags) {
    saveTagsState(tagsSheet, data.tags);
  }

  // Save to history first (for record keeping)
  appendToHistory(historySheet, data.values);

  // Update current schedule for the specific date
  updateScheduleForDate(currentSheet, historySheet, data.values, data.date);

  // Clean up old history
  cleanOldHistory(historySheet);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Schedule saved successfully',
    date: data.date
  })).setMimeType(ContentService.MimeType.JSON);
}

function setupSheet(sheet) {
  // Set up headers
  const headers = [
    'Date', 'Crew_Number', 'Team_Members', 'Crew_Leaders',
    'Managers', 'Truck', 'Equipment', 'Job_Name',
    'Salesman_PM', 'Last_Updated', 'Absent_Today', 'Out_Of_Service'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function updateCurrentSchedule(sheet, values) {
  // Clear existing data (except headers)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
  }

  // Skip the header row from values if it exists
  const dataToWrite = values[0] && values[0][0] === 'Date' ? values.slice(1) : values;

  if (dataToWrite.length > 0) {
    // Write new data
    sheet.getRange(2, 1, dataToWrite.length, dataToWrite[0].length).setValues(dataToWrite);

    // Auto-resize columns for better readability
    for (let i = 1; i <= sheet.getLastColumn(); i++) {
      sheet.autoResizeColumn(i);
    }
  }
}

function updateScheduleForDate(currentSheet, historySheet, values, targetDate) {
  // Skip the header row from values if it exists
  const dataToWrite = values[0] && values[0][0] === 'Date' ? values.slice(1) : values;

  if (dataToWrite.length === 0) return;

  // Get all data from history sheet
  const historyData = historySheet.getDataRange().getValues();
  if (historyData.length <= 1) return; // No data except headers

  // Find the most recent complete schedule for each date
  const schedulesByDate = new Map();

  // Process from newest to oldest to get most recent configs
  for (let i = historyData.length - 1; i >= 1; i--) {
    const row = historyData[i];
    const rowDate = row[0];
    let dateStr = '';

    if (rowDate instanceof Date) {
      dateStr = rowDate.toLocaleDateString();
    } else {
      dateStr = String(rowDate);
    }

    if (!schedulesByDate.has(dateStr)) {
      schedulesByDate.set(dateStr, []);
    }

    // Only add if this crew hasn't been added yet for this date
    const crewNum = row[1];
    const existingRows = schedulesByDate.get(dateStr);
    const crewExists = existingRows.some(existingRow => existingRow[1] === crewNum);

    if (!crewExists) {
      schedulesByDate.get(dateStr).unshift(row); // Add to beginning to maintain order
    }
  }

  // Update current sheet with most recent schedule from each date (last 7 days)
  const today = new Date();
  const recentSchedules = [];

  // Add header
  recentSchedules.push(historyData[0]);

  // Get schedules from last 7 days
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const checkDateStr = checkDate.toLocaleDateString();

    if (schedulesByDate.has(checkDateStr)) {
      const dateSchedule = schedulesByDate.get(checkDateStr);
      recentSchedules.push(...dateSchedule);
    }
  }

  // Update current sheet
  if (recentSchedules.length > 1) {
    currentSheet.clear();
    currentSheet.getRange(1, 1, recentSchedules.length, recentSchedules[0].length).setValues(recentSchedules);
    currentSheet.getRange(1, 1, 1, recentSchedules[0].length).setFontWeight('bold');
    currentSheet.setFrozenRows(1);

    // Auto-resize columns
    for (let i = 1; i <= currentSheet.getLastColumn(); i++) {
      currentSheet.autoResizeColumn(i);
    }
  }
}

function appendToHistory(sheet, values) {
  // Skip header if present in values
  const dataToAppend = values[0] && values[0][0] === 'Date' ? values.slice(1) : values;

  if (dataToAppend.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, dataToAppend.length, dataToAppend[0].length).setValues(dataToAppend);
  }
}

function cleanOldHistory(sheet) {
  if (sheet.getLastRow() <= 1) return; // No data to clean

  const data = sheet.getDataRange().getValues();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_RETENTION_DAYS);

  const rowsToKeep = [data[0]]; // Keep header

  for (let i = 1; i < data.length; i++) {
    const rowDate = data[i][0];
    if (rowDate instanceof Date && rowDate > cutoffDate) {
      rowsToKeep.push(data[i]);
    } else if (typeof rowDate === 'string') {
      // Try to parse string date
      const parsed = new Date(rowDate);
      if (!isNaN(parsed) && parsed > cutoffDate) {
        rowsToKeep.push(data[i]);
      }
    }
  }

  // Only update if we're actually removing rows
  if (rowsToKeep.length < data.length) {
    sheet.clear();
    if (rowsToKeep.length > 0) {
      sheet.getRange(1, 1, rowsToKeep.length, rowsToKeep[0].length).setValues(rowsToKeep);
      sheet.getRange(1, 1, 1, rowsToKeep[0].length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
}

function getYesterdaySchedule(dateString) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);

    if (!historySheet || historySheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'No historical data available'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = historySheet.getDataRange().getValues();
    const yesterdayRows = [];
    const crewMap = new Map();
    let lastTimestamp = '';
    let summaryRow = null;

    // Process from newest to oldest to get most recent configs
    for (let i = data.length - 1; i >= 1; i--) {
      const rowDate = data[i][0];
      let dateStr = '';

      if (rowDate instanceof Date) {
        dateStr = rowDate.toLocaleDateString();
      } else {
        dateStr = String(rowDate);
      }

      if (dateStr === dateString) {
        const crewNum = data[i][1];

        if (crewNum === 'SUMMARY') {
          // Keep the most recent summary row
          if (!summaryRow) {
            summaryRow = data[i];
          }
        } else if (crewNum && !crewMap.has(crewNum)) {
          // Keep the most recent entry for each crew
          crewMap.set(crewNum, data[i]);
        }

        // Track the timestamp
        if (data[i][9] && !lastTimestamp) {
          lastTimestamp = data[i][9];
        }
      }
    }

    // Convert map to array and add summary if found
    const finalRows = Array.from(crewMap.values());
    if (summaryRow) {
      finalRows.push(summaryRow);
    }

    if (finalRows.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'No schedule found for ' + dateString
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      rows: finalRows,
      timestamp: lastTimestamp
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error getting yesterday schedule:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getScheduleForDate(dateString) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);

    if (!historySheet || historySheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'No historical data available'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = historySheet.getDataRange().getValues();
    const crewMap = new Map();
    let lastTimestamp = '';
    let summaryRow = null;

    // Process from newest to oldest to get most recent configs for the specific date
    for (let i = data.length - 1; i >= 1; i--) {
      const rowDate = data[i][0];
      let dateStr = '';

      if (rowDate instanceof Date) {
        dateStr = rowDate.toLocaleDateString();
      } else {
        dateStr = String(rowDate);
      }

      if (dateStr === dateString) {
        const crewNum = data[i][1];

        if (crewNum === 'SUMMARY') {
          if (!summaryRow) {
            summaryRow = data[i];
          }
        } else if (crewNum && !crewMap.has(crewNum)) {
          crewMap.set(crewNum, data[i]);
        }

        if (data[i][9] && !lastTimestamp) {
          lastTimestamp = data[i][9];
        }
      }
    }

    const finalRows = Array.from(crewMap.values());
    if (summaryRow) {
      finalRows.push(summaryRow);
    }

    return ContentService.createTextOutput(JSON.stringify({
      rows: finalRows,
      timestamp: lastTimestamp,
      date: dateString
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error getting schedule for date:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Utility function to manually clean up sheets (can run from script editor)
function manualCleanup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);

  if (historySheet) {
    cleanOldHistory(historySheet);
    SpreadsheetApp.getUi().alert('Cleanup completed. Old records removed.');
  } else {
    SpreadsheetApp.getUi().alert('No history sheet found.');
  }
}

// Function to reset everything (use with caution)
function resetAllData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Reset All Data?',
    'This will delete all current and historical schedule data. Are you sure?',
    ui.ButtonSet.YES_NO
  );

  if (response == ui.Button.YES) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    const currentSheet = spreadsheet.getSheetByName(CURRENT_SHEET_NAME);
    if (currentSheet) {
      spreadsheet.deleteSheet(currentSheet);
    }

    const historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);
    if (historySheet) {
      spreadsheet.deleteSheet(historySheet);
    }

    ui.alert('All schedule data has been reset.');
  }
}

// Scheduled function to run daily cleanup (set up a trigger for this)
function dailyMaintenance() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);

  if (historySheet) {
    cleanOldHistory(historySheet);
    console.log('Daily maintenance completed at ' + new Date());
  }
}

// ============ TAGS MANAGEMENT FUNCTIONS ============

function setupTagsSheet(sheet) {
  // Set up headers for tags
  const headers = [
    'Tag_Name', 'Tag_Type', 'Tag_Subtype', 'Created_Date', 'Last_Updated', 'Status'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Initialize with default tags if this is a new sheet
  initializeDefaultTags(sheet);
}

function initializeDefaultTags(sheet) {
  const defaultTags = [
    // People
    ['Jacob', 'person', 'crew-leader', new Date(), new Date(), 'active'],
    ['Vern', 'person', 'person', new Date(), new Date(), 'active'],
    ['Andreas', 'person', 'person', new Date(), new Date(), 'active'],
    ['Jaime', 'person', 'person', new Date(), new Date(), 'active'],
    ['Layne', 'person', 'crew-leader', new Date(), new Date(), 'active'],
    ['Daniel', 'person', 'person', new Date(), new Date(), 'active'],
    ['Nathan', 'person', 'person', new Date(), new Date(), 'active'],
    ['Ben', 'person', 'manager', new Date(), new Date(), 'active'],
    ['Juan Manuel', 'person', 'person', new Date(), new Date(), 'active'],
    ['Juan Andreas', 'person', 'person', new Date(), new Date(), 'active'],
    ['Scott', 'person', 'manager', new Date(), new Date(), 'active'],
    ['Zach', 'person', 'person', new Date(), new Date(), 'active'],
    ['Amador', 'person', 'person', new Date(), new Date(), 'active'],
    ['Edgar', 'person', 'person', new Date(), new Date(), 'active'],
    ['Alejandro', 'person', 'person', new Date(), new Date(), 'active'],
    ['Hayden', 'person', 'person', new Date(), new Date(), 'active'],
    ['Brandon', 'person', 'crew-leader', new Date(), new Date(), 'active'],
    ['Tyler', 'person', 'person', new Date(), new Date(), 'active'],
    ['Fredirico', 'person', 'person', new Date(), new Date(), 'active'],
    ['Miguel', 'person', 'person', new Date(), new Date(), 'active'],
    ['Andrew', 'person', 'person', new Date(), new Date(), 'active'],
    ['Lupe', 'person', 'person', new Date(), new Date(), 'active'],
    ['Jose I', 'person', 'crew-leader', new Date(), new Date(), 'active'],
    ['Trey', 'person', 'manager', new Date(), new Date(), 'active'],
    ['Ashe', 'person', 'manager', new Date(), new Date(), 'active'],
    ['Dean', 'person', 'manager', new Date(), new Date(), 'active'],
    ['James', 'person', 'manager', new Date(), new Date(), 'active'],
    ['Dove', 'person', 'manager', new Date(), new Date(), 'active'],
    ['Chase', 'person', 'crew-leader', new Date(), new Date(), 'active'],
    ['Armando', 'person', 'person', new Date(), new Date(), 'active'],
    ['Pulo', 'person', 'crew-leader', new Date(), new Date(), 'active'],
    ['Jonathan', 'person', 'crew-leader', new Date(), new Date(), 'active'],

    // Trucks
    ['305 Power wagon', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['306 plow', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['307 Short Side', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['308 White 350', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['309 Power Wagon', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['310 Silver 350', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['701 Open Bed', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['301 Big Metal', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['302 Old Girl 7.3', 'truck', 'truck', new Date(), new Date(), 'active'],
    ['303 Wood Side', 'truck', 'truck', new Date(), new Date(), 'active'],

    // Equipment
    ['SVL 75 Open', 'equipment', 'trailer', new Date(), new Date(), 'active'],
    ['SVL 75 closed', 'equipment', 'trailer', new Date(), new Date(), 'active'],
    ['Dingo 1000', 'equipment', 'trailer', new Date(), new Date(), 'active'],
    ['Dingo 500', 'equipment', 'trailer', new Date(), new Date(), 'active'],
    ['Hydro Seeder', 'equipment', 'machine', new Date(), new Date(), 'active'],
    ['S85', 'equipment', 'machine', new Date(), new Date(), 'active'],
    ['Vermeer', 'equipment', 'machine', new Date(), new Date(), 'active'],
    ['Deere 319', 'equipment', 'machine', new Date(), new Date(), 'active'],
    ['Deere 333', 'equipment', 'machine', new Date(), new Date(), 'active'],
    ['KX 057', 'equipment', 'machine', new Date(), new Date(), 'active'],
    ['KX 040', 'equipment', 'machine', new Date(), new Date(), 'active']

    // No default jobs - user wants to start fresh
  ];

  if (defaultTags.length > 0) {
    sheet.getRange(2, 1, defaultTags.length, defaultTags[0].length).setValues(defaultTags);
  }
}

function saveTagsState(sheet, tags) {
  // This function updates the Tags_Master sheet with the current tag state
  // It will mark deleted tags as 'deleted' and add new tags

  const now = new Date();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return; // No existing data

  // Get current tags from frontend
  const currentTags = new Set();

  // Collect all current tag names
  if (tags.people) {
    tags.people.forEach(person => currentTags.add(person.name));
  }
  if (tags.trucks) {
    tags.trucks.forEach(truck => currentTags.add(truck.name));
  }
  if (tags.equipment) {
    tags.equipment.forEach(equipment => currentTags.add(equipment.name));
  }
  if (tags.jobs) {
    tags.jobs.forEach(job => currentTags.add(job.name));
  }

  // Update existing tags status
  for (let i = 1; i < data.length; i++) {
    const tagName = data[i][0];
    const currentStatus = data[i][5];

    if (currentTags.has(tagName)) {
      // Tag still exists - mark as active and update timestamp
      sheet.getRange(i + 1, 5).setValue(now); // Last_Updated
      sheet.getRange(i + 1, 6).setValue('active'); // Status
    } else if (currentStatus === 'active') {
      // Tag was deleted - mark as deleted
      sheet.getRange(i + 1, 5).setValue(now); // Last_Updated
      sheet.getRange(i + 1, 6).setValue('deleted'); // Status
    }
  }

  // Add new tags that don't exist in the sheet
  const existingTagNames = new Set();
  for (let i = 1; i < data.length; i++) {
    existingTagNames.add(data[i][0]);
  }

  const newTags = [];

  // Add new people
  if (tags.people) {
    tags.people.forEach(person => {
      if (!existingTagNames.has(person.name)) {
        newTags.push([person.name, 'person', person.type, now, now, 'active']);
      }
    });
  }

  // Add new trucks
  if (tags.trucks) {
    tags.trucks.forEach(truck => {
      if (!existingTagNames.has(truck.name)) {
        newTags.push([truck.name, 'truck', 'truck', now, now, 'active']);
      }
    });
  }

  // Add new equipment
  if (tags.equipment) {
    tags.equipment.forEach(equipment => {
      if (!existingTagNames.has(equipment.name)) {
        newTags.push([equipment.name, 'equipment', equipment.type, now, now, 'active']);
      }
    });
  }

  // Add new jobs
  if (tags.jobs) {
    tags.jobs.forEach(job => {
      if (!existingTagNames.has(job.name)) {
        newTags.push([job.name, 'job', 'job', now, now, 'active']);
      }
    });
  }

  // Insert new tags
  if (newTags.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, newTags.length, 6).setValues(newTags);
  }
}

function getCurrentState() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let tagsSheet = spreadsheet.getSheetByName(TAGS_SHEET_NAME);
    let historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);

    // Initialize tags sheet if it doesn't exist
    if (!tagsSheet) {
      tagsSheet = spreadsheet.insertSheet(TAGS_SHEET_NAME);
      setupTagsSheet(tagsSheet);

      // If we have existing history data, migrate tags from it
      if (historySheet && historySheet.getLastRow() > 1) {
        migrateTagsFromHistory(tagsSheet, historySheet);
      }
    } else {
      // Check if tags sheet is empty (except headers) and migrate if needed
      if (tagsSheet.getLastRow() <= 1 && historySheet && historySheet.getLastRow() > 1) {
        migrateTagsFromHistory(tagsSheet, historySheet);
      }
    }

    // Get current tags
    const tags = getCurrentTags(tagsSheet);

    // Get today's schedule if available
    const today = new Date().toLocaleDateString();
    let schedule = null;
    let lastUpdate = null;

    if (historySheet && historySheet.getLastRow() > 1) {
      const scheduleData = getScheduleForDateInternal(historySheet, today);
      if (scheduleData.rows && scheduleData.rows.length > 0) {
        schedule = parseScheduleData(scheduleData.rows);
        lastUpdate = scheduleData.timestamp;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      tags: tags,
      schedule: schedule,
      lastUpdate: lastUpdate || 'Never',
      success: true
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error getting current state:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getCurrentTags(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  const tags = {
    people: [],
    trucks: [],
    equipment: [],
    jobs: []
  };

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = row[0];
    const type = row[1];
    const subtype = row[2];
    const status = row[5];

    if (status !== 'active') continue; // Skip deleted tags

    if (type === 'person') {
      tags.people.push({ name: name, type: subtype });
    } else if (type === 'truck') {
      tags.trucks.push({ name: name });
    } else if (type === 'equipment') {
      tags.equipment.push({ name: name, type: subtype });
    } else if (type === 'job') {
      tags.jobs.push({ name: name });
    }
  }

  return tags;
}

function getScheduleForDateInternal(historySheet, dateString) {
  const data = historySheet.getDataRange().getValues();
  const crewMap = new Map();
  let lastTimestamp = '';
  let summaryRow = null;

  // Process from newest to oldest to get most recent configs for the specific date
  for (let i = data.length - 1; i >= 1; i--) {
    const rowDate = data[i][0];
    let dateStr = '';

    if (rowDate instanceof Date) {
      dateStr = rowDate.toLocaleDateString();
    } else {
      dateStr = String(rowDate);
    }

    if (dateStr === dateString) {
      const crewNum = data[i][1];

      if (crewNum === 'SUMMARY') {
        if (!summaryRow) {
          summaryRow = data[i];
        }
      } else if (crewNum && !crewMap.has(crewNum)) {
        crewMap.set(crewNum, data[i]);
      }

      if (data[i][9] && !lastTimestamp) {
        lastTimestamp = data[i][9];
      }
    }
  }

  const finalRows = Array.from(crewMap.values());
  if (summaryRow) {
    finalRows.push(summaryRow);
  }

  return {
    rows: finalRows,
    timestamp: lastTimestamp,
    date: dateString
  };
}

function parseScheduleData(rows) {
  // Convert the raw rows back into the schedule format expected by the frontend
  const schedule = {
    crews: [],
    absent: [],
    outOfService: []
  };

  rows.forEach(row => {
    const crewNumber = parseInt(row[1]);

    if (crewNumber && crewNumber >= 1 && crewNumber <= 8) {
      // This is a crew row
      const crew = {
        number: crewNumber,
        members: [],
        vehicles: row[5] ? row[5].split(',').map(v => v.trim()).filter(v => v) : [],
        equipment: row[6] ? row[6].split(',').map(e => e.trim()).filter(e => e) : [],
        jobs: row[7] ? row[7].split(',').map(j => j.trim()).filter(j => j) : [],
        salesman: row[8] || ''
      };

      // Add team members
      if (row[2]) {
        const members = row[2].split(',').map(m => m.trim()).filter(m => m);
        members.forEach(name => {
          crew.members.push({ name: name, isLeader: false, isManager: false });
        });
      }

      // Add crew leaders
      if (row[3]) {
        const leaders = row[3].split(',').map(l => l.trim()).filter(l => l);
        leaders.forEach(name => {
          crew.members.push({ name: name, isLeader: true, isManager: false });
        });
      }

      // Add managers
      if (row[4]) {
        const managers = row[4].split(',').map(m => m.trim()).filter(m => m);
        managers.forEach(name => {
          crew.members.push({ name: name, isLeader: false, isManager: true });
        });
      }

      schedule.crews.push(crew);
    } else if (row[1] === 'SUMMARY') {
      // This is the summary row with absent and out of service
      if (row[10]) {
        const absentNames = row[10].split(',').map(a => a.trim()).filter(a => a);
        absentNames.forEach(name => {
          schedule.absent.push({ name: name });
        });
      }

      if (row[11]) {
        const outOfServiceNames = row[11].split(',').map(o => o.trim()).filter(o => o);
        outOfServiceNames.forEach(name => {
          schedule.outOfService.push({ name: name });
        });
      }
    }
  });

  return schedule;
}

// ============ MIGRATION FUNCTIONS ============

function migrateTagsFromHistory(tagsSheet, historySheet) {
  console.log('Starting migration of tags from history data...');

  const historyData = historySheet.getDataRange().getValues();
  if (historyData.length <= 1) return; // No data to migrate

  const uniqueTags = new Set();
  const tagsByCategory = {
    people: new Set(),
    trucks: new Set(),
    equipment: new Set(),
    jobs: new Set()
  };

  // Process all history data to find unique tags
  for (let i = 1; i < historyData.length; i++) {
    const row = historyData[i];

    // Skip summary rows
    if (row[1] === 'SUMMARY') continue;

    // Extract people (Team Members - column 2)
    if (row[2]) {
      const members = row[2].split(',').map(m => m.trim()).filter(m => m);
      members.forEach(name => {
        if (name && !uniqueTags.has(name)) {
          tagsByCategory.people.add(name);
          uniqueTags.add(name);
        }
      });
    }

    // Extract crew leaders (column 3)
    if (row[3]) {
      const leaders = row[3].split(',').map(l => l.trim()).filter(l => l);
      leaders.forEach(name => {
        if (name && !uniqueTags.has(name)) {
          tagsByCategory.people.add(name);
          uniqueTags.add(name);
        }
      });
    }

    // Extract managers (column 4)
    if (row[4]) {
      const managers = row[4].split(',').map(m => m.trim()).filter(m => m);
      managers.forEach(name => {
        if (name && !uniqueTags.has(name)) {
          tagsByCategory.people.add(name);
          uniqueTags.add(name);
        }
      });
    }

    // Extract trucks (column 5)
    if (row[5]) {
      const trucks = row[5].split(',').map(t => t.trim()).filter(t => t);
      trucks.forEach(name => {
        if (name && !uniqueTags.has(name)) {
          tagsByCategory.trucks.add(name);
          uniqueTags.add(name);
        }
      });
    }

    // Extract equipment (column 6)
    if (row[6]) {
      const equipment = row[6].split(',').map(e => e.trim()).filter(e => e);
      equipment.forEach(name => {
        if (name && !uniqueTags.has(name)) {
          tagsByCategory.equipment.add(name);
          uniqueTags.add(name);
        }
      });
    }

    // Extract jobs (column 7)
    if (row[7]) {
      const jobs = row[7].split(',').map(j => j.trim()).filter(j => j);
      jobs.forEach(name => {
        if (name && !uniqueTags.has(name)) {
          tagsByCategory.jobs.add(name);
          uniqueTags.add(name);
        }
      });
    }
  }

  // Now populate the tags sheet with the discovered tags
  const tagsToAdd = [];
  const now = new Date();

  // Add people (we'll classify them as 'person' by default since we can't determine role from history)
  Array.from(tagsByCategory.people).forEach(name => {
    // Try to guess the role based on common names/patterns in your data
    let subtype = 'person';
    if (isLikelyCrewLeader(name)) {
      subtype = 'crew-leader';
    } else if (isLikelyManager(name)) {
      subtype = 'manager';
    }

    tagsToAdd.push([name, 'person', subtype, now, now, 'active']);
  });

  // Add trucks
  Array.from(tagsByCategory.trucks).forEach(name => {
    tagsToAdd.push([name, 'truck', 'truck', now, now, 'active']);
  });

  // Add equipment (we'll classify as 'machine' by default)
  Array.from(tagsByCategory.equipment).forEach(name => {
    let subtype = 'machine';
    if (isLikelyTrailer(name)) {
      subtype = 'trailer';
    }
    tagsToAdd.push([name, 'equipment', subtype, now, now, 'active']);
  });

  // Skip adding jobs - user wants to start fresh
  // Array.from(tagsByCategory.jobs).forEach(name => {
  //   tagsToAdd.push([name, 'job', 'job', now, now, 'active']);
  // });

  // Write all tags to the sheet
  if (tagsToAdd.length > 0) {
    const startRow = tagsSheet.getLastRow() + 1;
    tagsSheet.getRange(startRow, 1, tagsToAdd.length, 6).setValues(tagsToAdd);
    console.log(`Migrated ${tagsToAdd.length} tags from history data`);
  }
}

function isLikelyCrewLeader(name) {
  // Based on your original data, these are crew leaders
  const crewLeaders = ['Jacob', 'Layne', 'Brandon', 'Jose I', 'Chase', 'Pulo', 'Jonathan'];
  return crewLeaders.includes(name);
}

function isLikelyManager(name) {
  // Based on your original data, these are managers
  const managers = ['Ben', 'Scott', 'Trey', 'Ashe', 'Dean', 'James', 'Dove'];
  return managers.includes(name);
}

function isLikelyTrailer(name) {
  // Equipment names that are likely trailers vs machines
  const trailerKeywords = ['SVL', 'Dingo'];
  return trailerKeywords.some(keyword => name.includes(keyword));
}

// Manual migration function you can run from the script editor
function manualMigrateTagsFromHistory() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let tagsSheet = spreadsheet.getSheetByName(TAGS_SHEET_NAME);
  let historySheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);

  if (!tagsSheet) {
    tagsSheet = spreadsheet.insertSheet(TAGS_SHEET_NAME);
    setupTagsSheet(tagsSheet);
  }

  if (historySheet && historySheet.getLastRow() > 1) {
    // Clear existing tags first (except headers)
    if (tagsSheet.getLastRow() > 1) {
      tagsSheet.getRange(2, 1, tagsSheet.getLastRow() - 1, tagsSheet.getLastColumn()).clear();
    }

    migrateTagsFromHistory(tagsSheet, historySheet);
    SpreadsheetApp.getUi().alert('Migration completed! Check the Tags_Master sheet.');
  } else {
    SpreadsheetApp.getUi().alert('No history data found to migrate from.');
  }
}

// Function to clean up existing job tags - run this once to remove old jobs
function clearExistingJobs() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let tagsSheet = spreadsheet.getSheetByName(TAGS_SHEET_NAME);

  if (!tagsSheet || tagsSheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('No tags sheet found or no data to clean.');
    return;
  }

  const data = tagsSheet.getDataRange().getValues();
  const rowsToDelete = [];

  // Find all job rows
  for (let i = 1; i < data.length; i++) {
    const tagType = data[i][1]; // Tag_Type column
    if (tagType === 'job') {
      rowsToDelete.push(i + 1); // +1 because sheets are 1-indexed
    }
  }

  // Delete job rows (start from the bottom to maintain row indices)
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    tagsSheet.deleteRow(rowsToDelete[i]);
  }

  SpreadsheetApp.getUi().alert(`Cleared ${rowsToDelete.length} job tags. Job pool is now empty and ready for fresh entries.`);
}
