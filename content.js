var firstHref = $("a[href^='http']").eq(0).attr("href");

console.log(firstHref);

OUTPUT_FILENAME = 'matches.csv'


USER_GUID = '34E617A6-092E-49C8-9A44-D1F8E9ABD255'

FIELD_NAMES = ['displayName', 'subjectGender', 'testGuid', 'createdDate', 'note']
RELATIONSHIP_FIELD_NAMES = ['meiosis', 'sharedCentimorgans', 'sharedSegments', 'confidence']

MAX_TOTAL_RETRIES = 10
MAX_RETRIES_PER_URL = 1

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);
      console.log(request.cookie);
      downloadMatches(request.cookie);
    }
  }
);

function downloadMatches(cookie) {
  const pageNumber = 0;
  const retries = 0;
  const retries_per_url = 0;

  // while (true) {
  console.log(`page ${pageNumber + 1}...`);
  const url = buildUrl(USER_GUID, pageNumber);
  var settings = {
    "dataType": "json",
    "async": true,
    "crossDomain": true,
    "url": url,
    "method": "GET",
    // "headers": { "cookie": cookie }
    "xhrFields": {
      "withCredentials": true
    },
    success: (response) => { writeMatches(response) }
  }

  $.ajax(settings, (response) => {
    console.log("response");
    console.log(response);
  });
  // }

}

function errorHandler() {
  console.log("error");
}

function buildUrl(userGuid, pageNumber) {
  return `https://www.ancestry.co.uk/discoveryui-matchesservice/api/samples/${userGuid}/matchesv2?bookmarkdata={{"lastMatchesServicePageIdx":${pageNumber}}}`
}

function writeMatches(response) {
  console.log("response", response);
}

// function addButton(){
//   var $input = $('<input type="button" value="new button" />');
//   $input.prependTo($("body"));
// }

// addButton();
