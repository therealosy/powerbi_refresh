const PAUSE_DURATION = 5000; //in ms
const DEFAULT_TIME = 15000; //in ms
let INTERVAL_DURATION = 0;
const POLLING_RATE = 50; //in ms
let RELOAD_INTERVAL = 120000; //in ms
let TIMER_SET = false;

let i = 0;

let Btns = [];
let changeInterval = undefined;
let moveTimeout = undefined;
let refreshBtn = undefined;
let iframeDoc = undefined;

const getBtns = () => {
  let validBtn = [];
  console.log("Trying to get Buttons");
  iframeDoc = window.document.querySelector(
    "iframe.viewer.pbi-frame"
  )?.contentDocument;
  if (iframeDoc != undefined) {
    btnQueryVal =
      "div.section.dynamic.thumbnail-container.ui-draggable.ui-draggable-handle.droppableElement.ui-droppable.pbi-focus-outline";
    let btnList = iframeDoc.querySelectorAll(btnQueryVal);
    if (btnList.length > 0) {
      btnList.forEach((elem, index) => {
        if (!elem.classList.value.includes("hidden")) {
          validBtn.push(elem);
        }
        if (elem.classList.value.includes("selected")) {
          i = index + 1;
        }
      });
      console.log("Success");
      console.log(`Got ${validBtn.length} Buttons`);
    }
  }
  return validBtn;
};

const changeSlide = () => {
  if (Btns.length < 1) {
    Btns = getBtns();
    return;
  } else if (!TIMER_SET) {
    RELOAD_INTERVAL += Btns.length * INTERVAL_DURATION;
    setTimeout(reloadPage, RELOAD_INTERVAL);
    console.log(`Reload interval set to ${RELOAD_INTERVAL / 1000}s`);
    TIMER_SET = true;
  }

  i %= Btns.length;

  if (Btns[i] == undefined) {
    stop();
    console.log("Unable to Fetch Button Data");
    reloadPage();
    return;
  }
  Btns[i].click();
  i++;
  console.log("Changing...");
};

const start = () => {
  console.log("Started");
  console.log(`Interval set to ${INTERVAL_DURATION / 1000}s`);
  if (INTERVAL_DURATION > 0) {
    changeInterval = setInterval(() => {
      changeSlide();
    }, INTERVAL_DURATION);
  } else {
    console.log("quit");
  }
};

const stop = () => {
  console.log("Stopped");
  clearInterval(changeInterval);
};

const reloadPage = () => {
  window.location.reload();
};

const pauseSlides = () => {
  setTimeout(() => {
    if (moveTimeout != undefined) {
      clearTimeout(moveTimeout);
      stop();
    }
    moveTimeout = setTimeout(start, PAUSE_DURATION);
  }, POLLING_RATE);
};

window.onmousemove = (event) => {
  pauseSlides();
};

window.onload = () => {
  console.log("Extension ON");
  chrome.storage.local
    .get(["interval"])
    .then(({ interval }) => {
      if (interval == undefined) {
        chrome.storage.local.set({ interval: DEFAULT_TIME }).then(() => {
          console.log(`Default value set to ${DEFAULT_TIME / 1000}s`);
        });
      }
      INTERVAL_DURATION = interval * 1000;
      start();
    })
    .catch((err) => {
      console.log("err");
    });
};

chrome.storage.onChanged.addListener((changes, areaName) => {
  reloadPage();
});
