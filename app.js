const hourHand = document.querySelector("#hour-hand");
const minuteHand = document.querySelector("#minute-hand");
const secondHand = document.querySelector("#second-hand");
const digitalTime = document.querySelector("#digital-time");
const todayDate = document.querySelector("#today-date");
const timezoneName = document.querySelector("#timezone-name");
const clockFace = document.querySelector("#clock-face");
const secondsToggle = document.querySelector("#seconds-toggle");
const soundToggle = document.querySelector("#sound-toggle");
const soundLabel = document.querySelector("#sound-label");
const soundNote = document.querySelector("#sound-note");

let showSeconds = true;
let soundEnabled = false;
let audioContext;
let previousSecond = -1;

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});
const zoneFormatter = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" });

function tickSound() {
  if (!soundEnabled) return;
  audioContext ??= new window.AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 1100;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.022, audioContext.currentTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.035);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.04);
}

function updateClock() {
  const now = new Date();
  const ms = now.getMilliseconds();
  const seconds = now.getSeconds() + ms / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  hourHand.style.transform = `rotate(${hours * 30}deg)`;
  minuteHand.style.transform = `rotate(${minutes * 6}deg)`;
  secondHand.style.transform = `rotate(${seconds * 6}deg)`;
  secondHand.hidden = !showSeconds;

  digitalTime.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: true,
  }).format(now);
  todayDate.textContent = dateFormatter.format(now);
  timezoneName.textContent = zoneFormatter.formatToParts(now).find((part) => part.type === "timeZoneName")?.value ?? "Local time";
  clockFace.setAttribute("aria-label", `Clock showing ${digitalTime.textContent} local time`);

  if (now.getSeconds() !== previousSecond) {
    previousSecond = now.getSeconds();
    tickSound();
  }
  requestAnimationFrame(updateClock);
}

secondsToggle.addEventListener("click", () => {
  showSeconds = !showSeconds;
  secondsToggle.setAttribute("aria-pressed", String(showSeconds));
  secondsToggle.lastElementChild.textContent = showSeconds ? "Show seconds" : "Hide seconds";
});

soundToggle.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Turn tick sound off" : "Turn tick sound on");
  soundLabel.textContent = soundEnabled ? "Sound on" : "Sound off";
  soundNote.textContent = soundEnabled ? "Listen for a soft tick each second." : "A soft tick with every second.";
  if (soundEnabled) {
    audioContext ??= new window.AudioContext();
    await audioContext.resume();
    tickSound();
  }
});

updateClock();
