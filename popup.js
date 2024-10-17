document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  const clearBtn = document.getElementById('clear-btn');
  console.log('Dom loaded!')

  saveBtn.addEventListener('click', () => {
    console.log("Save Button Was Clicked!")
    // check URL to see if it is youtube



    // chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    //   var activeTab = tabs[0];
    //   chrome.tabs.sendMessage(activeTab.id,{ action: 'count', tag }, response => {
    //     console.log(response)
    //     if (response.count) {
    //       resultDiv.innerText = `The HTML tag '${tag}' appears ${response.count} times on this page.`;
    //     } else {
    //       resultDiv.innerText = 'Invalid tag or unable to count.';
    //     }
    //   });
    // });
  });

  clearBtn.addEventListener('click', () =>{
    console.log("Clear Button was clicked!")
  })

  // Options page
const optionsElement = document.querySelector("#go-to-options")
if (!optionsElement) {
  console.error("Could not find options element")
} else {
  optionsElement.addEventListener("click", function () {
    window.open(chrome.runtime.getURL("options.html"))
    // This code is based on Chrome for Developers documentation
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    // if (chrome.runtime.openOptionsPage) {
    //   chrome.runtime.openOptionsPage().catch((error: unknown) => {
    //     console.error("Could not open options page", error)
    //   })
    // } else {
    //   window.open(chrome.runtime.getURL("options.html"))
    // }
  })
}



});




  