let INTERVAL_DURATION = 0;
let IS_POWERBI_URL = true;

let tabIndex = 0;
let powerBiTabs = [];

let changeInterval = undefined;
let switchTimeout = undefined;

function getPowerBiTabs() {
  const powerBiIframeQuery = "iframe.viewer.pbi-frame";
  const tabQuery =
    "div.section.dynamic.thumbnail-container.ui-draggable.ui-draggable-handle.droppableElement.ui-droppable.pbi-focus-outline";

  let powerBiIframe = undefined;
  let validTabs = [];

  console.log("Trying to get Buttons");

  powerBiIframe =
    window.document.querySelector(powerBiIframeQuery)?.contentDocument;

  if (powerBiIframe === undefined) return [];

  let tabsList = powerBiIframe.querySelectorAll(tabQuery);

  if (tabsList.length > 0) {
    tabsList.forEach((tab) => {
      if (tab.classList.value.includes("hidden")) return;
      validTabs.push(tab);
    });
    console.log("Success");
    console.log(`Got ${validTabs.length} Buttons`);
  }
  return validTabs;
}

function changeSlide() {
  if (powerBiTabs.length < 1) {
    powerBiTabs = getPowerBiTabs();
    return;
  } else if (tabIndex >= powerBiTabs.length) {
    switchTabs();
    return;
  }

  if (powerBiTabs[tabIndex] == undefined) {
    stop();
    console.log("Unable to Fetch Button Data");

    switchTabs();
    return;
  }
  powerBiTabs[tabIndex].click();
  tabIndex++;
  console.log("Changing...");
}

function start() {
  console.log("Started");
  console.log(`Interval set to ${INTERVAL_DURATION / 1000}s`);
  if (INTERVAL_DURATION <= 0) {
    switchTabs();
    return;
  }
  if (IS_POWERBI_URL) {
    changeInterval = setInterval(() => {
      changeSlide();
    }, INTERVAL_DURATION);
    return;
  }
  switchTimeout = setTimeout(() => {
    switchTabs();
  }, INTERVAL_DURATION);
}

function stop() {
  console.log("Stopped");
  if (IS_POWERBI_URL) clearInterval(changeInterval);
  else clearTimeout(switchTimeout);
}

function switchTabs() {
  stop();

  setTimeout(() => {
    chrome.runtime
      ?.sendMessage("switch-tabs")
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, 500);
}

window.onload = () => {
  chrome.storage.local
    .get(["interval", "powerBiBaseURL", "isExtensionDisabled"])
    .then(({ interval, powerBiBaseURL, isExtensionDisabled }) => {
      if (isExtensionDisabled) return;

      INTERVAL_DURATION = interval * 1000;
      IS_POWERBI_URL = window.location.href.startsWith(powerBiBaseURL);
      start();
    })
    .catch((error) => {
      console.log("Error Loading Chrome Storage", error);
    });
};
