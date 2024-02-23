import React, { useState } from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { DateTime } from 'luxon';
import './App.css';

const App = () => {
    return (
      <div className="App">
        <div className="App-header">
          <h2>ICS Calendar Generator</h2>
          <p>A generator of a ICS files to load in your calendar.</p>
        </div>
        <br/><br/>
        <p className="App-intro">
          Load a csv file with names and date of birth.
        </p>
        <br/>
        <FileForm/>
        <div id="preview"></div>
      </div>
    );
}

function FileForm() {
  const [csvData, setCsvData] = useState([]);

  const previewCSV = () => {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (file) {
      Papa.parse(file, {
        complete: function(results) {
          setCsvData(results.data);
        }
      });
    }
  }

  const generateICSFile = () => {
      if (csvData.length === 0) {
        console.error('No data to generate the ICS file.');
        return;
      }
  
      // UTC-3 Time Zone
      const utcMinus3 = 'Etc/GMT-3';

      const icsContent = [];
      icsContent.push('BEGIN:VCALENDAR');
      icsContent.push('VERSION:2.0');
      icsContent.push('PRODID:-//m-franco.github.io//NONSGML My Calendar//EN');

      csvData.forEach((row) => {
        const dateStr = row[0];
        const person = row[1];
  
        const [day, month] = dateStr.split('/').map(Number);
        const year = new Date().getFullYear();
        const date = DateTime.fromObject({ year, month, day });
  
        const eventStart = date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).setZone(utcMinus3);
        const eventEnd = date.set({ hour: 0, minute: 30, second: 0, millisecond: 0 }).setZone(utcMinus3);

        if (person) {
          icsContent.push('BEGIN:VEVENT');
          icsContent.push(`SUMMARY:Birthday of ${person}`);
          icsContent.push(`DTSTART:${eventStart.toFormat('yyyyMMddTHHmmss')}`);
          icsContent.push(`DTEND:${eventEnd.toFormat('yyyyMMddTHHmmss')}`);
          icsContent.push('RRULE:FREQ=YEARLY;INTERVAL=1');
          icsContent.push('BEGIN:VALARM');
          icsContent.push('ACTION:DISPLAY');
          icsContent.push('DESCRIPTION:Reminder');
          icsContent.push('TRIGGER:-PT15M');
          icsContent.push('END:VALARM');
          icsContent.push('END:VEVENT');
        }
  
      });
  
      icsContent.push('END:VCALENDAR');
  
      const blob = new Blob([icsContent.join('\n')], { type: 'text/calendar;charset=utf-8' });
      saveAs(blob, 'Birthdays.ics');
  }

  return (
    <div>
      <input type="file" id="csvFile" accept=".csv" /> 
      <button onClick={previewCSV}>Preview CSV</button>

      {csvData.length > 0 && (
        <button onClick={generateICSFile}>Download ICS</button>
      )}

      <div className="dataTable"> 
        {csvData.length > 0 && (
          <table border="1">
            <thead>
              <tr>
                <th>{"Birthdate"}</th>
                <th>{"Name"}</th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {csvData.length > 0 && (
        <button onClick={generateICSFile}>Download ICS</button>
      )}
    </div>
  );
}

export default App;