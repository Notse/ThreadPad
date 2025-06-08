window.onload = function () {
    trigger();
    setupEventListenerForThemeSwitch();
    setupEventListenerForFileImport();
    setupEventListenerForCounter();
    initialCheckForTheme();
    initialCheckForCounter();
    initialCheckForToolbarPreference();
};

// Context Menu //
const contextMenu = document.querySelector('.contextMenu');
// const textEditor = document.getElementById('text_content');

document.addEventListener("contextmenu", displayContextMenu);

function displayContextMenu(event) {
    event.preventDefault();
    // "client" = "where you clicked inside the window you see". clientX and clientY are only based on the visible screen
    const { clientX: mouseX, clientY: mouseY } = event;
  
    // Position the menu and show it
    contextMenu.style.top = `${mouseY}px`;
    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.display = 'block';

    // Context submenu

 document.querySelectorAll('.submenu-list').forEach((item) => {
    console.log(item.id, 'item')
    item.addEventListener('mouseenter', () => {
    if(item.id === 'cx_heading') {
            document.querySelector('.menu_item--sublist-heading').style.display = 'block';
    }else {
        document.querySelector('.menu_item--sublist').style.display = 'block';
    }
    });
})

document.querySelectorAll('.submenu-list').forEach((item) => {
    item.addEventListener('mouseleave', () => {
        document.querySelector('.menu_item--sublist').style.display = 'none';
        document.querySelector('.menu_item--sublist-heading').style.display = 'none';
    });
})
  }

  function hideContextMenu() {
    contextMenu.style.display = 'none';
    
}

// Detecting clicks outside to hide context menu
document.addEventListener('click', hideContextMenu);
['scroll', 'resize'].forEach(event =>
  window.addEventListener(event, hideContextMenu)
);


// Styling: Headings, Bold, Italic, Underline, Quotes, Lists //

document.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', edit)
);

contextMenu.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', edit)
    // const format = btn.dataset.textformat;
})

function edit(ev) {
    ev.preventDefault();
    const cmd_val = this.getAttribute('data-edit').split(':');
    document.execCommand(cmd_val[0], false, cmd_val[1]);
}

document.addEventListener('selectionchange', multipleTextFormat)
// selection formatting while user keep selecting the text
function multipleTextFormat() {
    const selection = window.getSelection();
    if (selection.isCollapsed || !selection.rangeCount ) {
          console.log('No text selected ');
        //   hideContextMenu();
          contextMenu.querySelectorAll('[data-textFormat]').forEach((btn) => {
            btn.removeAttribute('id');
          });
          return;
        }
  
    const range = selection.getRangeAt(0);
    const formatStatus = {
      bold: false,
      italic: false,
      underline: false,
      headline: false,
      list: false,
      highlight: false,
      Olist: false,
      blockquote: false,
      insertLink: false,
    };
  
  
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Only consider nodes inside the actual selection
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);
  
          // Check if this node is intersecting with the selection range
          if (
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      }
    );
  
    let currentNode = walker.currentNode;
  
    while (currentNode) {
      let node = currentNode;
      while (node && node !== document.body) {
        const tag = node.tagName?.toLowerCase();
        // console.log(tag, 'tag')
        switch (tag) {
          case 'b':
          case 'strong':
          case 'bold' :
            formatStatus.bold = true;
            break;
          case 'i':
          case 'em':
            formatStatus.italic = true;
            break;
          case 'u':
            formatStatus.underline = true;
            break;
          case 'a':
            formatStatus.insertLink = true;
            break;
          case 'h1':
            formatStatus.headline = true;
            break;
          case 'ul':
            formatStatus.list = true;
            break;
          case 'ol':
            formatStatus.Olist = true;
            break;
          case 'blockquote':
            formatStatus.blockquote = true;
            break;
          case 'mark':
            formatStatus.highlight = true;
            break;
        }
        node = node.parentNode;
      }
      currentNode = walker.nextNode();
    }
  
    contextMenu.querySelectorAll('[data-textFormat]').forEach((btn) => {
          const format = btn.dataset.title;
          console.log(format, formatStatus[format], 'formatStatus[format]') 
          if(formatStatus[format]){ 
            btn.id = 'active_menu';
          } else {
            btn.removeAttribute('id');
          }
        });
  
    return formatStatus;
  }


// Functions: Links and Images //

const btns = document.querySelectorAll('[data-edt]');

function Space(aID) {

    return document.getElementById(aID);
}

function trigger() {
    let space = document.getElementById('content');
    space.designMode = 'on';
    space.addEventListener('mouseup', agent);
    space.addEventListener('keyup', agent);


//Buttons Commands //

    for (let b of btns) {
        b.addEventListener('click', () => {
            run(b.dataset.edt, b, b.dataset.param);
            document.getElementById('content').focus();
            document.getElementById('content').focus();
        });
    }

}

// Insert Link //

function run(cmd, ele, value = null) {
    let status = document.execCommand(cmd, false, value);
    if (!status) {
        switch (cmd) {
            case 'insertLink':
                value = prompt('Enter url');
                if (value.slice(0, 4) != 'http') {
                    value = 'http://' + value;
                }
                document.execCommand('createLink', false, value);

                // Overrides inherited attribute "contenteditable" from parent
                // which would otherwise prevent anchor tag from being interacted with.
                atag = document.getSelection().focusNode.parentNode;
                atag.setAttribute("contenteditable", "false");

                break;
        }
    }
}


// Insert Image //

if (window.File && window.FileList && window.FileReader) {
    const filesInput = document.getElementById("imageUpload");

    filesInput.addEventListener("change", function (event) {

        const files = event.target.files; //FileList object
        const output = document.getElementById("content");

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            //Only pics
            if (!file.type.match('image'))
                continue;

            const picReader = new FileReader();

            picReader.addEventListener("load", (event) => {

                const picSrc = event.target.result;

                const imgThumbnailElem = "<div class='imgView'><img  src='" + picSrc + "'" +
                    "title='" + file.name + "'/><h5 style=text-align:center;>Caption</h5></div>";

                output.innerHTML = output.innerHTML + imgThumbnailElem;

            });

            //Read the image
            picReader.readAsDataURL(file);
        }

    });
} else {
    alert("Your browser does not support File API");
}


// Word Counter //

function agent() {
    let currentCounterPreference = localStorage.getItem("counter-preference");

    var counterTotal;

    switch(currentCounterPreference) {
        case "character-count":
            counterTotal = characterCount(document.getElementById('content').innerText);
            break;
        case "word-count":
            counterTotal = wordCount(document.getElementById('content').innerText);
            break;
    }

    document.getElementById('counter').innerText = counterTotal;
}

// Count All Characters //
function characterCount(str) { 
    return str.length;
}

// Count Words //
function wordCount(str) { 
    return str.match(/\b[-?(\w+)?]+\b/gi).length;
}

// Check For Counter //
function initialCheckForCounter() {
    let counterPreference = "character-count";

    // Local storage is used to override OS theme settings
    if(localStorage.getItem("counter-preference")){
        if(localStorage.getItem("counter-preference") === "word-count"){
            counterPreference = "word-count";
        }
    }

    localStorage.setItem("counter-preference", counterPreference);
}

// Toggle Current Counter //
function toggleCounterPreference() {
    let currentCounterPreference = localStorage.getItem("counter-preference");

    switch(currentCounterPreference) {
        case "character-count":
            localStorage.setItem("counter-preference", "word-count");
            break;
        case "word-count":
            localStorage.setItem("counter-preference", "character-count");
            break;
    }

    agent();
}


// Counter Switch //
function setupEventListenerForCounter() {
    const counter = document.getElementById("counter");
    counter.addEventListener("click", function() {
        toggleCounterPreference();
    });
}


// Theme Switch //

function setupEventListenerForThemeSwitch() {
    const themeSwitch = document.getElementById("theme-switch");
    themeSwitch.addEventListener("click", function() {
        toggleThemePreference();
    });
}

// File Import //
function triggerImportFile() {
    const fileInput = document.getElementById("import-file")
    fileInput.click()
}

function setupEventListenerForFileImport() {
    const fileInput = document.getElementById("import-file")
    fileInput.addEventListener("change", (event) => {
        const file = event.currentTarget.files[0]
        if(!file){ return }
        const extension = file.name.split(".").pop()

        if(extension === "html" || "md"){
            const reader = new FileReader()
            reader.onload = function(){
                importContent(extension, reader.result)
            }

            reader.readAsText(file)
        } else {
            alert("File type is not supported for import")
        }
    })
}

function downloadContent(type) {
    let editorContent = ''
    if (type === 'txt') {
        editorContent = document.getElementById('content').textContent;
    } else if(type === 'md') {
        const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', emDelimiter: '*' });
        editorContent = turndownService.turndown(document.getElementById('content').innerHTML);
    } else {
        editorContent =`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Writty</title>
        </head>
            <body>
                ${document.getElementById('content').innerHTML}
            </body>
        </html>
        `
    }

    const linkElement = document.createElement("a")
    linkElement.setAttribute("download", `writty.${type}`)
    linkElement.setAttribute("href", 'data:text/plain;charset=utf-8,' + encodeURIComponent(editorContent))
    linkElement.click()

    document.body.removeChild(linkElement);
}

function importContent(fileExtension, content) {
    const editorElement = document.getElementById('content')
    if(fileExtension === 'html'){
        const sanitizedContent = HtmlSanitizer.SanitizeHtml(content)
        const tempElement = document.createElement("html")
        tempElement.innerHTML = sanitizedContent
        editorElement.innerHTML = tempElement.querySelector("body").innerHTML
    } else if(fileExtension === "md") {
        const converter = new showdown.Converter()
        const html = converter.makeHtml(content)
        editorElement.innerHTML = html
    } else {
        alert("Import only supports Markdown & HTML File")
    }

    agent()
}

// Toggle RTL //

function toggleRTL() {
    const editorElement = document.querySelector("#editor")
    const currentDir = editorElement.getAttribute("dir")
    if (!currentDir || currentDir === "ltr") {
        editorElement.setAttribute("dir", "rtl")
    } else {
        editorElement.setAttribute("dir", "ltr")
    } {
        var nav = document.querySelector('.topbar-button');
        nav.classList.toggle('active');
        e.preventDefault();
    }
}

function initialCheckForToolbarPreference() {
    const toolbarWindow = document.querySelector(".toolbar")
    const editorElement = document.querySelector("#editor")
    editorElement.setAttribute("editorMenu", `${localStorage.getItem('toolbar-preference')}`)
    const currentDir = editorElement.getAttribute("editorMenu")
    console.log(currentDir, 'currentDir')
    if (!currentDir || currentDir === "contextMenu" || currentDir === "null") {
        toolbarWindow.classList.add('d-none');
        document.querySelector('.switch-text').textContent = "Switch to Toolbar";
    } else {
        toolbarWindow.classList.remove('d-none');
        document.querySelector('.switch-text').textContent = "Hide Toolbar";
    }
}


function toggleToolbar(e) {
    const toolbarWindow = document.querySelector(".toolbar")
    const editorElement = document.querySelector("#editor")
    const currentDir = editorElement.getAttribute("editorMenu")
    console.log(currentDir, 'currentDir')
    if (!currentDir || currentDir === "contextMenu" || currentDir === "null") {
        editorElement.setAttribute("editorMenu", "toolbar")
        localStorage.setItem("toolbar-preference", "toolbar");
        toolbarWindow.classList.remove('d-none');
       document.querySelector('.switch-text').textContent = "Hide Toolbar"; 
    } else {
        editorElement.setAttribute("editorMenu", "contextMenu")
        localStorage.setItem("toolbar-preference", "contextMenu");
        toolbarWindow.classList.add('d-none');
        document.querySelector('.switch-text').textContent = "Switch to Toolbar";
    } {
        var nav = document.querySelector('.topbar-button');
        nav.classList.toggle('active');
        e.preventDefault();
    }
}

// Check for theme //

function initialCheckForTheme() {
    // Default to light-theme
    let themePreference = "light-theme";


    // Local storage is used to override OS theme settings
    if(localStorage.getItem("theme-preference")){
        if(localStorage.getItem("theme-preference") === "dark-theme"){
            themePreference = "dark-theme";
        }
    } else if(!window.matchMedia) {
        // matchMedia method not supported
        return false;
    } else if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
        // OS theme setting detected as dark
        themePreference = "dark-theme";
    }

    if (themePreference === "dark-theme") {
        const themeSwitch = document.getElementById("theme-switch");
        themeSwitch.checked = true;
    }

    localStorage.setItem("theme-preference", themePreference);
    document.body.classList.add(themePreference);
}

// Toggle current theme //

function toggleThemePreference() {
    let currentThemePreference = localStorage.getItem("theme-preference");

    switch(currentThemePreference) {
        case "light-theme":
            localStorage.setItem("theme-preference", "dark-theme");

            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
            break;
        case "dark-theme":
            localStorage.setItem("theme-preference", "light-theme");

            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");
            break;
      }
}

// Paste plain text //

const ce = document.querySelector('[contenteditable]');
ce.addEventListener('paste', function (e) {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});

// Paste image //

document.getElementById('content').addEventListener("paste", (event) => {
        var clipboardData = event.clipboardData;
        clipboardData.types.forEach((type, i) => {
            const fileType = clipboardData.items[i].type;
            if (fileType.match(/image.*/)) {
                const file = clipboardData.items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function (evt) {
                    const dataURL = evt.target.result;
                    const img = document.createElement("img");
                    img.src = dataURL;
                    document.execCommand('insertHTML', true, img.outerHTML);
                };
                reader.readAsDataURL(file);
            }
        })
    });


// Menu options Sidebar 

const sidebarBtn = document.querySelector('.fa-gear');
const sidebar = document.querySelector('.sidebar');

let isAnimating = false;

sidebarBtn.addEventListener('click', sidebarToggle);

function sidebarToggle () {
  if (isAnimating) {
    // Remove animation
    sidebarBtn.classList.remove('sidebar_btn-animation');
    sidebar.style.right = '-31rem';
    // Force reflow to allow animation to be reapplied next time
    console.log('remove',   sidebarBtn)
    isAnimating = false;
  } else {
    // Apply animation
    sidebarBtn.classList.add('sidebar_btn-animation');
    sidebar.style.right = '0px';
    console.log('add',)
    isAnimating = true;
  }
 
}
// pip


const video = document.getElementById("custom-video");

async function enablePiP() {
  if (video !== document.pictureInPictureElement) {
    try {
      await video.requestPictureInPicture();
    } catch (error) {
      console.error("Failed to enter PiP mode:", error);
    }
  } else {
    document.exitPictureInPicture();
  }
}

// pip code

let videoElement = document.getElementById('video');
let button = document.getElementById('Start-button');
let pipButton = document.getElementById('shareScreenBtn');
let Led = document.getElementById('led-red');
let switchStatus = document.getElementById('switch-status');

let Mode = false;

// modal code 
const modal = document.getElementById('optionsModal');
 const closeModalBtn = document.getElementById('closeModal');
  const shareScreenBtn = document.getElementById('shareScreenBtn');
  const uploadVideoBtn = document.getElementById('uploadVideoBtn');
  const fileInput = document.getElementById('fileInput');
//   const video = document.getElementById('video');

 // Close modal if user clicks outside modal content
   window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
//   close modal if user clicks on close button
    closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

async function selectMedia() {
    sidebarToggle(); // close sidebar
   modal.style.display = 'none'; // close modal
    try {
        const media = await navigator.mediaDevices.getDisplayMedia();
        videoElement.srcObject = media;

        videoElement.onloadedmetadata = () => {
            videoElement.play();
            button.disabled = false; // enable button only after video is ready
        };

        Mode = true;
        // ModeStatus();  

    } catch (error) {
        console.log('Error! select Media or not loaded ', error);
    }
}

 function uploadVideo() {
    modal.style.display = 'none'; // close modal
    sidebarToggle(); // close sidebar
    fileInput.value = ''; // reset previous files
    fileInput.click();
  }


    fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    videoElement.srcObject = null;
    videoElement.src = fileURL;
    videoElement.play();

    videoElement.onloadedmetadata = async () => {
      try {
        if (document.pictureInPictureEnabled) {
          await videoElement.requestPictureInPicture();
        } else {
          alert('Picture-in-Picture not supported in this browser.');
        }
      } catch (err) {
        console.error('PiP request failed:', err);
      }
    };
  });


button.addEventListener('click', async () => {
    try {
        if (videoElement.readyState >= 1) {
            await videoElement.requestPictureInPicture();
        } else {
            // Wait until metadata is loaded
            videoElement.addEventListener('loadedmetadata', async () => {
                await videoElement.requestPictureInPicture();
            }, { once: true });
        }

        // Led.id = 'led-red-on';
        // switchStatus.innerText = 'ON';

    } catch (error) {
        console.error('Failed to enter PiP:', error);
    }
});

button.addEventListener('click', () => {
    modal.style.display = 'block';
});

document.addEventListener('keydown', (e) => {
    console.log(e.key, 'key pressed');
  if (e.key === 'ArrowRight') videoElement.currentTime += 10;
  if (e.key === 'ArrowLeft') videoElement.currentTime -= 10;
  if (e.key.toLowerCase() === 'm') videoElement.muted = !videoElement.muted;
  if (e.key === 'u') videoElement.volume = Math.min(1, videoElement.volume + 0.1);
  if (e.key === 'd') videoElement.volume = Math.max(0, videoElement.volume - 0.1);
});

shareScreenBtn.addEventListener('click', selectMedia);
uploadVideoBtn.addEventListener('click', uploadVideo)