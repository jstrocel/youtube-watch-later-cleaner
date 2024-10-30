
(() => {
  let youtubePlaylistControls;
  let PlaylistControlsLoaded = false;
  let total_videos;
  let videos_on_screen = 0;
  let load_playlist = false;
  let all_videos_loaded = false;
  let currentUser = "";
  let currentPlaylist = "";
  let loadPlayListFinished = false; 
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
    loadPlaylistPromise().then(createPlayListCsv);
  }

  const createPlayListCsv = async() => {
    playlistItems = document.querySelectorAll('#contents .ytd-playlist-video-list-renderer ytd-playlist-video-renderer')
    
    var newPlaylistItems = [];

    let rows = [['index', 'video name', 'video url', 'video channel url', 'video channel name', 'video length']]
    
    for(i=0; i< playlistItems.length; i++){
      const index = playlistItems[i].querySelector('#index').textContent;
      const videoName = playlistItems[i].querySelector('#video-title').textContent.trim();
      const videoURL = "https://www.youtube.com" + playlistItems[i].querySelector('#video-title').getAttribute('href');
      const videoChannelURL = playlistItems[i].querySelector('#text > a').href;
      const videoChannelName = playlistItems[i].querySelector('#text > a').textContent.trim();
      const videoLength = playlistItems[i].querySelector('.badge-shape-wiz__text').innerText;
      row = [index, `"${videoName.replaceAll('#', '%23')}"`, videoURL, videoChannelURL, `"${videoChannelName}"`, `"${videoLength}"`]

      rows.push(row)
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

  }

  const deletePlaylistEventHandler = async() =>{
   var answer = window.confirm("This will delete your entire Playlist. Are you sure?");
      if (answer) {
        loadPlaylistPromise().then(deletePlayList);
      }
  }


  const deletePlayList = async() => {
    setInterval(function () {
      video = document.getElementsByTagName('ytd-playlist-video-renderer')[0];
  
      video.querySelector('#primary button[aria-label="Action menu"]').click();
  
      var things = document.evaluate(
          '//span[contains(text(),"Remove from")]',
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
      );
  
      for (var i = 0; i < things.snapshotLength; i++) 
      {
          things.snapshotItem(i).click();
      }
  }, 500);

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
    
  })
})


function loadPlaylistPromise(){
  return new Promise((resolve, reject) => {
    console.log("Woah! This Promise code is running!")

    const observerConfig = {attributes: false,characterData: true,childList: true,subtree: true,}
    const playlistObserver =  new MutationObserver((mutations) =>{

      mutations.forEach((mutation) => {
        if (loadPlayListFinished == false){
            loadVideos();

          spinner = document.getElementById("spinner")
          playlistItems =  document.getElementsByClassName("ytd-playlist-video-list-renderer")
          lastPlaylistItemTimeStamp = playlistItems[playlistItems.length-2].querySelector('.badge-shape-wiz__text')
          if ((spinner.checkVisibility() == false) && (lastPlaylistItemTimeStamp != null )) {
            loadPlayListFinished = true;
            videos_on_screen = document.getElementsByClassName("ytd-playlist-video-list-renderer").length
            resolve(`${videos_on_screen} videos loaded!`)
          };
        } else{
          resolve("Finished loading playlist!")
        }
         
      });
    })
    if (loadPlayListFinished == false){
      playlistObserver.observe(document, observerConfig);
      loadVideos();
    } else {
      resolve("Finished loading playlist!")
    }

  })
}

 const loadVideos = async () => { 
  const continuations = document.getElementById("continuations");
  continuations.scrollIntoView({ behavior: "instant", block: "end" });

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
})();
