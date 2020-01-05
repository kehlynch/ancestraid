chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log("guid", request.guid);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        addGenerateButton(request.guid);
      });
    } else {
      addGenerateButton(request.guid);
    }
  }
)

OUTPUT_FILENAME = 'matches.csv'

FIELD_NAMES = ['displayName', 'subjectGender', 'testGuid', 'createdDate', 'note']
RELATIONSHIP_FIELD_NAMES = ['meiosis', 'sharedCentimorgans', 'sharedSegments', 'confidence']

MAX_TOTAL_RETRIES = 10
MAX_RETRIES_PER_URL = 1

function addGenerateButton(guid) {
  const id = 'js-ancestraid';
  if (!$(`#${id}`).length) {
    const input = $(`<div id=${id}>`);
    input.prependTo($("body"));

    const buttonId = 'js-ancesteraid-generate-button';
    const link = $(`<button class="filter ancBtn outline btnFilter iconAfter" id=${buttonId} >ANCESTRAID - click here to generate matches</button>`);
    link.prependTo($(`#${id}`));
    $(`#${buttonId}`).on('click', () => { generateMatches(guid) } );
  }
}

function updateMessage(message) {
  const buttonId = 'js-ancesteraid-generate-button';
  $(`#${buttonId}`).html(`ANCESTRAID - ${message}`);
}

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if( request.message === "clicked_browser_action" ) {
//       downloadMatches(request.cookie);
//     }
//   }
// );

async function generateMatches(guid) {
  updateMessage('generating...');
  const retries = 0;
  const retries_per_url = 0;
  const moreMatches = true;

  let rows = [];
  let pageNumber = 0;
  let count = 0;
  while (true) {
    count++;
    console.log(`page ${pageNumber + 1}...`);
    updateMessage(`generating page ${pageNumber + 1}...`);
    
    const pageRows = await getMatches(pageNumber, guid);
    if (!!pageRows.length) {
      rows = rows.concat(pageRows)
    } else {
      break;
    }
    pageNumber++;
  }

  enableDownload(rows);
}

async function getMatches(pageNumber, guid, retry = 0) {
  const url = buildUrl(guid, pageNumber);
  // let rows = []
  await $.ajax({
    "dataType": "json",
    "async": true,
    "crossDomain": true,
    "url": url,
    "method": "GET",
    "xhrFields": {
      "withCredentials": true
    },
    success: (response) => {
      const rows = getMatchRows(response);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.log('ERROR');
      console.log('jqXHR:');
      console.log(jqXHR);
      console.log('textStatus:');
      console.log(textStatus);
      console.log('errorThrown:');
      console.log(errorThrown);
      if (retry > 2) {
        throw "Too many errors"
      } else {
        const rows = getMatches(pageNumber, guid, retry++)
      }
    }
  });
  return rows;
}

function getMatchRows(response) {
  rows = []

  response.matchGroups.map((matchGroup) => {
    matchGroup.matches.forEach((match) => {
      rows.push(match);
    })
  })

  return rows;
}

function enableDownload(rows) {
  csvwriter(rows, {fields: FIELD_NAMES}, (err, v) => {
    $('#js-ancestraid').empty();
    var text = v;

    var fileBlob = new Blob([text], {type: "application/octet-binary"});

    const link = $(`<button class="filter ancBtn outline btnFilter iconAfter"><a href=${URL.createObjectURL(fileBlob)} download=${OUTPUT_FILENAME}>ANCESTRAID - done - click to download</a></button>`);
    link.prependTo($('#js-ancestraid'));
  });
}

function buildUrl(userGuid, pageNumber) {
  return `https://www.ancestry.co.uk/discoveryui-matchesservice/api/samples/${userGuid}/matchesv2?bookmarkdata=%7B%22lastMatchesServicePageIdx%22%3A${pageNumber}%7D`
}
