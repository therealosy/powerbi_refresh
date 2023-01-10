const saveButton = document.querySelector("#saveButton");
const intervalInput = document.querySelector("#intervalInput");
const DEFAULT_TIME = 15;

let interval = 0;

window.onload = async () => {
  let { interval } = await chrome.storage.local.get(["interval"]);
  console.log(interval);
  if (interval == undefined) {
    interval = DEFAULT_TIME;
    await chrome.storage.local.set({ interval });
  }
  console.log(interval);
  intervalInput.value = parseInt(interval);
};

saveButton.onclick = async (event) => {
  event.preventDefault();
  await chrome.storage.local.set({ interval }).then(() => {
    console.log(`Value set to ${interval}`);
  });
};

intervalInput.onchange = ({ target }) => {
  interval = parseInt(target.value);
  console.log(target.value);
};
