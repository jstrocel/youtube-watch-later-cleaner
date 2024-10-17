
(() => {
  let youtubePlaylistControls;
  let PlaylistControlsLoaded = false;
  let total_videos;
  let videos_on_screen = 0;
  let load_playlist = false;
  let load_playlist_finished = false;
  let all_videos_loaded = false;
  let currentUser = "";
  let currentPlaylist = "";
  console.log("Extension Loaded!")

  
  const watchLaterPlaylistLoaded = async () => {
    console.log("Watch Later Playlist loaded!")
    const savePlayListBtnExists = document.getElementsByClassName("save-watch-later-btn")[0];
    const deletePlayListBtnExists = document.getElementsByClassName("load-watch-later-btn")[0];
    if (!savePlayListBtnExists) {
      console.log("There's no save playlist button here... Better Add one.")
      console.log("Adding Playlist")
      const saveBtn = document.createElement("img");
      saveBtn.src = chrome.runtime.getURL("assets/save.png")
      saveBtn.id = "watchlatersave"
      saveBtn.title = "Click to save this playlist"
      saveBtn.setAttribute("style", "cursor:pointer;")
      youtubePlaylistControls = document.getElementsByClassName("metadata-buttons-wrapper")[0];
      console.log(youtubePlaylistControls)
      youtubePlaylistControls.appendChild(saveBtn);
      saveBtn.addEventListener("click", savePlaylistEventHandler)

      const targetText = 'ytInitialData';
      const scriptElement = document.querySelectorAll('script')

      for(i=0; i<scriptElement.length; i++){
        if (scriptElement[i].innerText.includes("var ytInitialData = ")){
          const jsonData = JSON.parse(scriptElement[i].innerText.replace(/var ytInitialData = /, '').replace(';',''));
          currentUser = jsonData.header.playlistHeaderRenderer.playlistId.replace('/@','');
          
          currentPlaylist =jsonData.sidebar.playlistSidebarRenderer.items[1].playlistSidebarSecondaryInfoRenderer.videoOwner.videoOwnerRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url
        }
      }
  
    }
    if (!deletePlayListBtnExists) {
      console.log("There's no delete playlist button here... Better Add one.")
      console.log("Adding delete Playlist button")
      const deleteBtn = document.createElement("img");
      deleteBtn.src = chrome.runtime.getURL("assets/delete.png")
      deleteBtn.id = "watchlaterdelete"
      deleteBtn.title = "Click to delete the entire playlist"
      deleteBtn.setAttribute("style", "cursor:pointer;")
      youtubePlaylistControls = document.getElementsByClassName("metadata-buttons-wrapper")[0];
      console.log(youtubePlaylistControls)
      youtubePlaylistControls.appendChild(deleteBtn);
      deleteBtn.addEventListener("click", deletePlaylistEventHandler)
      //var pageInfo = document.head.split('<script nonce> var ytInitialData = ')[0];
    
    }
  }

  const savePlaylistEventHandler = async() =>{
    console.log("You just clicked to save the playlist. Hope you know what you are doing!")
    //#contents.style-scope.ytd-item-section-renderer,style-scope.ytd-item-section-renderer
    playlistItems = document.querySelectorAll('#contents .ytd-playlist-video-list-renderer ytd-playlist-video-renderer')
    console.log(`This playlist is displaying ${playlistItems.length} items.`)
    console.log(`Actual Playlist length is ${document.getElementsByClassName("metadata-stats")[0].children[1].innerText}`)
    console.log(playlistItems);
    var newPlaylistItems = [];

    let rows = [['index', 'video name', 'video url', 'video channel url', 'video channel name']]
    
    for(i=0; i<playlistItems.length; i++){
      const index = playlistItems[i].querySelector('#index').textContent;
      const videoName = playlistItems[i].querySelector('#video-title').textContent.trim();
      const videoURL = "https://www.youtube.com" + playlistItems[i].querySelector('#video-title').getAttribute('href');
      const videoChannelURL = playlistItems[i].querySelector('#text > a').href;
      const videoChannelName = playlistItems[i].querySelector('#text > a').textContent.trim();
      row = [index, `"${videoName.replaceAll('#', '%23')}"`, videoURL, videoChannelURL, `"${videoChannelName}"`]

      rows.push(row)
   
  
      console.log(`index: ${index}`);
      console.log(`Video Name: ${videoName}`);
      console.log(`Video URL: ${videoURL}`);
      console.log(`Video Channel URL: ${videoChannelURL}`);
      console.log(`Video Channel Name: ${videoChannelName}`);

      const newPlaylistEntry = {
        video_name: videoName,
        video_channel_name:videoChannelName,
        video_channel_url:videoChannelURL,
        video_url: videoURL,
        video_index: index,
        play_list_id: currentPlaylist
      }
    }


    let csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.join(",")).join("\n");

          var encodedUri = encodeURI(csvContent);
      window.open(encodedUri);

      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "my_data.csv");
      document.body.appendChild(link); // Required for FF

      link.click(); // This will download the data file named "my_data.csv".
      console.log(newPlaylistEntry);
      console.log(getBytesLength(JSON.stringify(newPlaylistEntry)))

      newPlaylistItems.push(newPlaylistEntry);
    console.log(JSON.stringify(newPlaylistItems))
    console.log(getBytesLength(JSON.stringify(newPlaylistItems)))
    console.log(chrome.storage.sync.set({[currentUser]: JSON.stringify(newPlaylistItems)}));
  }

  const deletePlaylistEventHandler = async() =>{
   var answer = window.confirm("This will delete your entire Playlist. Are you sure?");
      if (answer) {
        load_playlist = true;
        loadVideos();
      }
  }

  function getBytesLength(str) {
    return new TextEncoder().encode(str).length;
}


  // Create a MutationObserver to watch for changes to the DOM.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    youtubePlaylistControls = document.getElementsByClassName("metadata-buttons-wrapper")[0];
    if (youtubePlaylistControls && PlaylistControlsLoaded == false){
      console.log("Loaded Youtube Playlist Controls!")
      PlaylistControlsLoaded = true
      watchLaterPlaylistLoaded();
    }
    
    if(load_playlist == true){
      loadVideos();
    }
  })
})

const loadVideos = async () => {
  total_videos_string = document.getElementsByClassName("metadata-stats")[0]
  total_videos = total_videos_string.innerText.replace(/[^0-9]/g, '').split(',').map(Number).pop();
  videos_on_screen_new_total = document.getElementsByClassName("ytd-playlist-video-list-renderer").length
  spinner = document.getElementById("spinner")
  if (videos_on_screen < videos_on_screen_new_total){

    const continuations = document.getElementById("continuations");
    continuations.scrollIntoView({ behavior: "instant", block: "end" });

    videos_on_screen = videos_on_screen_new_total
   
    if (spinner.checkVisibility() == false){
      load_playlist = false;
    };
  } 
}

const fetchPlaylist = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([currentUser], (obj) => {
      resolve(obj[currentUser] ? JSON.parse(obj[currentUser]) : []);
    });
  });
};

observer.observe(document, {
  attributes: false,
  characterData: true,
  childList: true,
  subtree: true,
})


// Search this DOM node for text to blur and blur the parent element if found.
// function processNode(node) {
//   if (node.childNodes.length > 0) {
//       Array.from(node.childNodes).forEach(processNode)
//   }
//   if (node.nodeType === Node.TEXT_NODE && node.textContent !== null && node.textContent.trim().length > 0) {
//       const parent = node.parentElement
//       if (parent !== null && (parent.tagName === 'SCRIPT' || parent.style.filter === blurFilter)) {
//           // Already blurred
//           return
//       }
//       if (node.textContent.includes(textToBlur)) {
//           blurElement(parent)
//       }
//   }
// }


})();
//<ytd-menu-renderer force-icon-button tonal-override class="style-scope ytd-playlist-header-renderer" safe-area menu-active>
