// function getCookies(callback, domain='https://www.ancestry.co.uk') {
//   console.log("getcookies");
//   chrome.cookies.getAll({}, function(cookies) {
//     const cookieString = cookies.map((c) => {
//       Cookies.set(c.name, c.value);
//       return `${c.name}=${c.value}`
//     }).join(";");
//     callback(cookieString);
//   });
// }

// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//   // Send a message to the active tab
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const activeTab = tabs[0];
    const url = activeTab.url;
    // TODO make this less brittle
    const guid = url.split('?')[0].split('/')[5];
    console.log("guid", guid);	
    chrome.tabs.sendMessage(activeTab.id, {guid: guid});
  });
});
