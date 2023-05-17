let tabList = [];
let activeTabIndex = 0;

const DEFAULT_INTERVAL = 15;
const DEFAULT_TOGGLE = true;
const DEFAULT_POWERBI_BASE_URL = "CHANGE ME!!";

async function updateTabList() {
  const tabs = await chrome.tabs.query({
    lastFocusedWindow: true,
  });

  tabs.forEach(({ id }) => {
    tabList.push(id);
  });
  console.log(tabList);
}

async function switchTabs() {
  try {
    await chrome.tabs.update(
      (tabId = tabList[activeTabIndex]),
      (updateProperties = { active: true })
    );
  } catch (error) {
    console.log(error);
  }
}

async function initializeStorage() {
  let [interval, cycleBrowserTabs, powerBiBaseURL] = [
    DEFAULT_INTERVAL,
    DEFAULT_TOGGLE,
    DEFAULT_POWERBI_BASE_URL,
  ];
  await chrome.storage.local
    .set({ interval, cycleBrowserTabs, powerBiBaseURL })
    .then(() => {
      console.log("After setting:", {
        interval,
        cycleBrowserTabs,
        powerBiBaseURL,
      });
    });
}

chrome.tabs.onCreated.addListener(async () => {
  console.log("new tab created");
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  console.log("tab removed", tabId);
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
  }
});

chrome.tabs.onDetached.addListener(async (tabId, detachInfo) => {
  console.log("tab detached", tabId);
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
  }
});

chrome.tabs.onAttached.addListener(async (tabId, attachInfo) => {
  console.log("tab attached", tabId);
  try {
    await updateTabList();
    switchTabs();
  } catch (error) {
    console.log(error);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  console.log("activeId", tabId);
  try {
    await chrome.tabs.reload((tabId = tabId)).then(() => {
      console.log("Reloading Tab");
    });
    activeTabIndex = tabList.indexOf(tabId);
  } catch (error) {
    console.log(error);
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("installed because", details.reason);
  try {
    await initializeStorage();
    await updateTabList();
    switchTabs();
  } catch (error) {
    console.log(error);
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("tabs", activeTabIndex);
  console.log("tabList", tabList);

  if (request == "switch-tabs") {
    activeTabIndex++;
    activeTabIndex %= tabList.length;

    switchTabs();
    sendResponse("Switching tabs");
  }
  // else if (message == 'goodbye') {
  //   chrome.runtime.Port.disconnect();
  // }
});
