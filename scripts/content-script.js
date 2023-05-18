let INTERVAL_DURATION = 0;
let SHOULD_CYCLE_BROWSER_TABS = false;
let IS_POWERBI_URL = true;

let i = 0;

let Btns = [];
const iframeQueryVal = "iframe.viewer.pbi-frame";
const btnQueryVal =
  "div.section.dynamic.thumbnail-container.ui-draggable.ui-draggable-handle.droppableElement.ui-droppable.pbi-focus-outline";

let changeInterval = undefined;
let switchTimeout = undefined;
let refreshBtn = undefined;
let iframeDoc = undefined;

const getBtns = () => {
  let validBtn = [];
  console.log("Trying to get Buttons");
  iframeDoc = window.document.querySelector(iframeQueryVal)?.contentDocument;

  if (iframeDoc == undefined) return [];

  let btnList = iframeDoc.querySelectorAll(btnQueryVal);

  if (btnList.length > 0) {
    btnList.forEach((elem) => {
      if (!elem.classList.value.includes("hidden")) {
        validBtn.push(elem);
      }
    });
    console.log("Success");
    console.log(`Got ${validBtn.length} Buttons`);
  }
  return validBtn;
};

const changeSlide = () => {
  if (Btns.length < 1) {
    Btns = getBtns();
    return;
  } else if (i >= Btns.length) {
    switchTabs();
    return;
  }

  if (Btns[i] == undefined) {
    stop();
    console.log("Unable to Fetch Button Data");

    switchTabs();
    return;
  }
  Btns[i].click();
  i++;
  console.log("Changing...");
};

const start = () => {
  console.log("Started");
  console.log(`Interval set to ${INTERVAL_DURATION / 1000}s`);
  if (INTERVAL_DURATION <= 0) {
    console.log("quit");
    switchTabs();
  } else if (IS_POWERBI_URL) {
    changeInterval = setInterval(() => {
      changeSlide();
    }, INTERVAL_DURATION);
  } else {
    switchTimeout = setTimeout(() => {
      switchTabs();
    }, INTERVAL_DURATION);
  }
};

const stop = () => {
  console.log("Stopped");
  if (IS_POWERBI_URL) clearInterval(changeInterval);
  else clearTimeout(switchTimeout);
};

const reloadPage = () => {
  window.location.reload();
};

const switchTabs = () => {
  stop();

  // if (!SHOULD_CYCLE_BROWSER_TABS) {
  //   reloadPage();
  //   return;
  // }

  setTimeout(() => {
    chrome?.runtime
      ?.sendMessage("switch-tabs")
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, 1000);
};

window.onload = () => {
  console.log(window.location.href);
  chrome.storage.local
    .get([
      "interval",
      "shouldCycleBrowserTabs",
      "powerBiBaseURL",
      "isExtensionDisabled",
    ])
    .then(
      ({
        interval,
        shouldCycleBrowserTabs,
        powerBiBaseURL,
        isExtensionDisabled,
      }) => {
        console.log("ext_dis", isExtensionDisabled);
        if (isExtensionDisabled) return;
        INTERVAL_DURATION = interval * 1000;
        SHOULD_CYCLE_BROWSER_TABS = shouldCycleBrowserTabs;
        IS_POWERBI_URL = window.location.href.startsWith(powerBiBaseURL);
        start();

        console.log("IS_POWERBI_URL", IS_POWERBI_URL);
      }
    )
    .catch((err) => {
      console.log("err");
    });
};

chrome.storage.onChanged.addListener((changes, areaName) => {
  reloadPage();
});
