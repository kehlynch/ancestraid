function getCookies(callback, domain='https://www.ancestry.co.uk') {
  console.log("getcookies");
  chrome.cookies.getAll({}, function(cookies) {
    const cookieString = cookies.map((c) => {
      Cookies.set(c.name, c.value);
      return `${c.name}=${c.value}`
    }).join(";");
    callback(cookieString);
  });
}

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    console.log("about to getcookies");
    getCookies(function(cookie) {
      console.log(cookie);
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action", "cookie": cookie});
    });

  });
});
