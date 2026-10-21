/**
 * Star City Cup tracker script.
 *
 * Does two things so nobody has to by hand:
 *  1. Last Week: the first time a new week's OHW score is entered, it saves the
 *     standings from before that week onto the Last Week tab (for the up/down arrows).
 *  2. Score lock: when a Club Championship or Major tab's Status is set to Final,
 *     it protects that tab's score column. Anyone changing a locked score gets a
 *     warning first. Setting Status back to In progress or Not started unlocks it.
 *
 * Install once: Extensions > Apps Script, paste this file, Save, choose "setup" in
 * the function list, click Run, and allow access when Google asks.
 */

var LOCK_TABS = ['Club Championship', 'Masters', 'US Open', 'The Open', 'PGA Championship'];
var SCORE_RANGE = { 'Club Championship': 'B6:C155', 'Masters': 'B7:C156', 'US Open': 'B7:C156',
                    'The Open': 'B7:C156', 'PGA Championship': 'B7:C156' };
var STATUS_CELL = 'B2';
var LOCK_NOTE = 'Star City Cup: locked because this event is Final';
var SNAPSHOT_TAB = '_Standings Snapshot';
var OHW_RANGE = 'A5:C1668';      // Date, Player, Gross Score
var STANDINGS_RANGE = 'A2:C500';  // Rank, Player, Cup Total
var WEEK_KEY = 'scc_ohw_week';

function setup() {
  var ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'handleEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('handleEdit').forSpreadsheet(ss).onEdit().create();
  saveSnapshot_();
  PropertiesService.getDocumentProperties().setProperty(WEEK_KEY, String(latestOhwWeek_()));
  LOCK_TABS.forEach(function (name) { applyLock_(ss.getSheetByName(name)); });
  ss.toast('Star City Cup script is set up.', 'Star City Cup', 5);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Star City Cup')
    .addItem('Save current standings as Last Week', 'saveLastWeekNow')
    .addItem('Re-check score locks', 'recheckLocks')
    .addToUi();
}

function handleEdit(e) {
  var sheet = e.range.getSheet();
  var name = sheet.getName();
  if (LOCK_TABS.indexOf(name) >= 0 && e.range.getA1Notation() === STATUS_CELL) applyLock_(sheet);

  var props = PropertiesService.getDocumentProperties();
  var week = latestOhwWeek_();
  var saved = Number(props.getProperty(WEEK_KEY) || 0);
  if (week > saved) {
    // A new OHW week just started. The snapshot still holds the standings from
    // before this edit, which is last week's final standings.
    copySnapshotToLastWeek_();
    props.setProperty(WEEK_KEY, String(week));
  }
  saveSnapshot_();
}

function saveLastWeekNow() {
  saveSnapshot_();
  copySnapshotToLastWeek_();
  SpreadsheetApp.getActive().toast('Saved the current standings as Last Week.', 'Star City Cup', 5);
}

function recheckLocks() {
  var ss = SpreadsheetApp.getActive();
  LOCK_TABS.forEach(function (name) { applyLock_(ss.getSheetByName(name)); });
  ss.toast('Score locks match each tab\'s Status.', 'Star City Cup', 5);
}

function applyLock_(sheet) {
  if (!sheet) return;
  var range = sheet.getRange(SCORE_RANGE[sheet.getName()]);
  sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) {
    if (p.getDescription() === LOCK_NOTE) p.remove();
  });
  if (sheet.getRange(STATUS_CELL).getValue() === 'Final') {
    range.protect().setDescription(LOCK_NOTE).setWarningOnly(true);
  }
}

function latestOhwWeek_() {
  var rows = SpreadsheetApp.getActive().getSheetByName('OHW').getRange(OHW_RANGE).getValues();
  var latest = 0;
  rows.forEach(function (r) {
    if (r[0] instanceof Date && r[1] !== '' && typeof r[2] === 'number') latest = Math.max(latest, r[0].getTime());
  });
  return latest;
}

function snapshotSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SNAPSHOT_TAB);
  if (!sh) { sh = ss.insertSheet(SNAPSHOT_TAB); sh.hideSheet(); }
  return sh;
}

function saveSnapshot_() {
  var values = SpreadsheetApp.getActive().getSheetByName('Standings').getRange(STANDINGS_RANGE).getValues();
  snapshotSheet_().getRange(STANDINGS_RANGE).setValues(values);
}

function copySnapshotToLastWeek_() {
  var values = snapshotSheet_().getRange(STANDINGS_RANGE).getValues()
    .filter(function (r) { return r[1] !== ''; });
  var lw = SpreadsheetApp.getActive().getSheetByName('Last Week');
  lw.getRange(STANDINGS_RANGE).clearContent();
  if (values.length) lw.getRange(2, 1, values.length, 3).setValues(values);
}
