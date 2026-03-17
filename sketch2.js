const sheetURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRPpsvt_FRwyyuC9-Kq9clODHgoNj0uk4ExXkufZDEhrv9ogSVa47f0JkfWlEtm98yaJwztiibmeJ8j/pub?gid=1858164230&single=true&output=csv`;

fetch(sheetURL)
  .then((response) => response.text())
  .then((csvText) => handleResponse(csvText));

function handleResponse(csvText) {
  let sheetObjects = parseCSV(csvText);
  // sheetObjects is now an Array of Objects
  console.log(sheetObjects);
  // Display all objects in the HTML
  const container = document.querySelector('.info');
  container.innerHTML = '';
  sheetObjects.forEach(obj => {
    const card = document.createElement('div');
    card.className = 'card';
    let imgHTML = '';
    if (obj.Photo) {
      imgHTML = `<img class="photo" src="${obj.Photo}" alt="${obj.Name || 'Artwork'}">`;
    }
    let inquireHTML = '';
    if (obj.Inquire) {
      inquireHTML = `<a class="inquire-btn" href="${obj.Inquire}" target="_blank" rel="noopener noreferrer">Inquire</a>`;
    }
    card.innerHTML = `
      <div class="card-flex">
        ${imgHTML}
        <div class="card-content">
          <p class="artist">${obj.Artist || ''}</p>
          <p class="name">${obj.Name || ''}</p>
          <p class="material">${obj.Material || ''}</p>
          <p class="size">${obj.Size || ''}</p>
          <p class="availability${['Not available', 'Sold'].includes(obj.Availability) ? ' not-available' : ''}">${obj.Availability || ''}</p>
        </div>
        ${inquireHTML}
      </div>
    `;
    container.appendChild(card);
  });
}

function csvToObjects(csv) {
  const csvRows = csv.split("\n");
  const propertyNames = csvSplit(csvRows[0]).map(name => name.trim());
  let objects = [];
  for (let i = 1, max = csvRows.length; i < max; i++) {
    let thisObject = {};
    let row = csvSplit(csvRows[i]);
    for (let j = 0, max = row.length; j < max; j++) {
      const key = propertyNames[j];
      // Trim whitespace and carriage returns from values
      const value = row[j] ? row[j].trim().replace(/\r$/, '') : '';
      thisObject[key] = value;
    }
    objects.push(thisObject);
  }
  return objects;
}

// Improved CSV parser: handles quoted fields, commas, line breaks, and escaped quotes
function parseCSV(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < csv.length) {
    const char = csv[i];
    if (inQuotes) {
      if (char === '"') {
        if (csv[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          row.push(field);
          field = '';
        } else if (char === '\r') {
          // ignore
        } else if (char === '\n') {
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
        } else {
          field += char;
        }
      }
      i++;
    }
    // Add last field/row if not already added
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    // Convert to objects
    const propertyNames = rows[0].map(name => name.trim());
    let objects = [];
    for (let i = 1; i < rows.length; i++) {
      let thisObject = {};
      let rowArr = rows[i];
      for (let j = 0; j < propertyNames.length; j++) {
        const key = propertyNames[j];
        const value = rowArr[j] ? rowArr[j].trim() : '';
        thisObject[key] = value;
      }
      objects.push(thisObject);
    }
    return objects;
  }