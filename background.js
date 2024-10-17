chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.pageLoaded) {
      if (sender.tab && sender.tab.id != null) {
        console.log("Message Received!")
      }
    }
  })