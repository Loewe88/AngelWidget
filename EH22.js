// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;

// Name: Engel EH22
// Description: Displays next angel shift from Easterhegg 2025
// Author: Marcel Stuht
// Version: 1.0

function getShiftsUrl() {
  const key = args.widgetParameter;
  if (!key) {
    throw new Error("no_key");
  }
  return `https://engel.eh22.easterhegg.eu/shifts-json-export?key=${key}`;
}

async function fetchShifts() {
  const url = getShiftsUrl();
  const req = new Request(url);
  const response = await req.loadJSON();
  return response;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#1a1a1a");
  
  const title = widget.addText("Nächster Engel-Dienst");
  title.font = Font.boldSystemFont(16);
  title.textColor = Color.white();
  widget.addSpacer(8);
  
  try {
    const shifts = await fetchShifts();
    const now = new Date();
    
    // Find next shift
    const nextShift = shifts
      .filter(shift => new Date(shift.start_date) > now)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
    
    if (nextShift) {
      const startTime = formatDate(nextShift.start_date);
      const endTime = formatDate(nextShift.end_date);
      
      const shiftTitle = widget.addText(nextShift.title);
      shiftTitle.font = Font.systemFont(14);
      shiftTitle.textColor = Color.white();
      widget.addSpacer(4);
      
      const timeText = widget.addText(`${startTime} - ${endTime}`);
      timeText.font = Font.systemFont(12);
      timeText.textColor = Color.lightGray();
      widget.addSpacer(4);
      
      const locationText = widget.addText(`📍 ${nextShift.Name}`);
      locationText.font = Font.systemFont(12);
      locationText.textColor = Color.lightGray();
    } else {
      const noShiftText = widget.addText("Keine kommenden Dienste");
      noShiftText.font = Font.systemFont(14);
      noShiftText.textColor = Color.lightGray();
    }
  } catch (error) {
    if (error.message === "no_key") {
      const errorText = widget.addText("Bitte API-Key hinzufügen");
      errorText.font = Font.systemFont(14);
      errorText.textColor = Color.yellow();
      widget.addSpacer(4);
      const helpText = widget.addText("Widget-Parameter bearbeiten");
      helpText.font = Font.systemFont(12);
      helpText.textColor = Color.lightGray();
    } else {
      const errorText = widget.addText("Fehler beim Laden der Dienste");
      errorText.font = Font.systemFont(14);
      errorText.textColor = Color.red();
    }
  }
  
  return widget;
}

// Create and show widget
const widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentSmall();
}

Script.complete();
