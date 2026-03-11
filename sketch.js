const sheetURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRPpsvt_FRwyyuC9-Kq9clODHgoNj0uk4ExXkufZDEhrv9ogSVa47f0JkfWlEtm98yaJwztiibmeJ8j/pub?gid=0&single=true&output=csv`;

fetch(sheetURL)
  .then((response) => response.text())
  .then((csvText) => handleResponse(csvText));

function handleResponse(csvText) {
  let sheetObjects = csvToObjects(csvText);
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
          <p class="availability">${obj.Availability || ''}</p>
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

function csvSplit(row) {
  // This regex splits on commas not inside quotes
  // Handles fields like "a,b","c" => ["a,b", "c"]
  const re = /(?:"([^"]*(?:""[^"]*)*)"|([^",]+)|)(?:,|$)/g;
  const result = [];
  let match;
  let lastIndex = 0;
  while ((match = re.exec(row)) !== null) {
    let value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2] || '';
    result.push(value);
    lastIndex = re.lastIndex;
    if (lastIndex >= row.length) break;
  }
  // Remove trailing empty field if row ends with a comma
  if (result.length && result[result.length - 1] === '' && row[row.length - 1] !== ',') {
    result.pop();
  }
  return result;
}

// function preload(){
//   info_csv = fetch("")
// }

// function setup() {
//   createCanvas(400, 400);
//   print(info_csv);
// }

// function draw() {
//   background(220);
// }