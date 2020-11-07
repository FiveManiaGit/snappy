/*
 * SNAPPY -----------
 * ----- by FiveMania
 * 
 * Screen recorder --
 * -- Screenshot app
 */

// Imports and elements!
const { remote, clipboard, nativeImage } = require('electron');

const video = document.querySelector('video#preview');
const recordButton = document.querySelector('#record');
const printButton = document.querySelector('#screenshot');

const videoOptions = document.querySelector('.videoOptions');
const photoOptions = document.querySelector('.photoOptions');

const options = {
  video: document.querySelector('#useVideo'),
  photo: document.querySelector('#usePhoto'),
}

const appWindow = remote.getCurrentWindow();

const selects = {
  video: {
    resolution: document.querySelector('#resolution'),
    constraint: document.querySelector('#constraint')
  },
  photo: {
    resolution: document.querySelector('#presolution'),
    constraint: document.querySelector('#pconstraint'),
    saveTo: document.querySelector('#psaveto')
  }
}

const countdownOverlay = document.querySelector('#countdown');
const modalBox = document.querySelector('#modal');

const themeButton = document.querySelector('#theme');

// Settings and states
let isRecording = false;
let resolution = localStorage.resolution || "720p";
let constraint = localStorage.constraint || "desktop";
let saveTo = localStorage.saveTo || "clipboard";
let theme = localStorage.theme || "dark";
let mediaType = localStorage.mediaType || "video";

// Media definitions
const resolutions = {
  "144p": {w: 256, h: 144},
  "240p": {w: 426, h: 240},
  "360p": {w: 640, h: 360},
  "480p": {w: 854, h: 480},
  "640p": {w: 1138, h: 640},
  "720p": {w: 1280, h: 720},
  "1080p": {w: 1920, h: 1080},
  "1440p": {w: 2560, h: 1440},
  "2160p": {w: 3840, h: 2160}
}

// Also media definitions but with localization thingy
const constraintValues = {
  "desktop": "Desktop",
  "camera": "Camera",
  "cameraNoAudio": "Camera (no audio)"
};

const saveToValues = {
  "clipboard": "Copy to clipboard",
  "file": "Save to file"
}

// UI functions
async function countdown(seconds) {
  return new Promise((resolve, reject) => {
    countdownOverlay.innerText = "Prepare...";
    countdownOverlay.style.top = "-150%";
    countdownOverlay.style.width = "100%";
    countdownOverlay.style.height = "100%";

    anime({
      targets: '#countdown',
      duration: 1000,
      top: '50%',
      easing: 'easeInOutExpo',
      complete: () => {
        let timer = seconds;
        countdownOverlay.innerText = "3";
        const interval = setInterval(() => {
          timer--;

          anime({
            targets: '#countdown',
            duration: 1000,
            width: `${(timer / seconds) * 100}%`,
            height: `${(timer / seconds) * 100}%`,
            easing: 'easeInOutQuart'
          });

          countdownOverlay.innerText = timer;

          if (timer <= 0) {
            resolve();
            clearInterval(interval);
          }
        }, 1000);
      }
    });
  });
}

async function modal(text, bg, fg) {
  return new Promise((resolve, reject) => {
    modalBox.innerHTML = text;
    modalBox.style.top = "-150%";
    modalBox.style.width = "unset";
    modalBox.style.height = "unset";
    modalBox.style.padding = "25px 75px";
    modalBox.style.transform = "translate(-50%, -50%) scale(1)";
    modalBox.style.background = bg;
    modalBox.style.color = fg;

    anime({
      targets: '#modal',
      duration: 1000,
      top: '50%',
      easing: 'easeInOutExpo',
      complete: () => setTimeout(() => {
        anime({
          targets: '#modal',
          duration: 1000,
          scale: 0,
          easing: 'easeInOutExpo',
          complete: resolve
        });
      }, 1000)
    });
  });
}

// Main stuff
function assignVideo() {
  const constraints = {
    camera: {
      audio: true,
      video: {
        frameRate: {
          ideal: 30,
          max: 60
        },
        width: resolutions[resolution].w,
        height: resolutions[resolution].h
      },
    },
    cameraNoAudio: {
      audio: false,
      video: {
        frameRate: {
          ideal: 30,
          max: 60
        },
        width: resolutions[resolution].w,
        height: resolutions[resolution].h
      },
    },
    desktop: {
      audio: false,
      video: {
        cursor: "always",
        mandatory: {
          chromeMediaSource: 'desktop',
          minWidth: resolutions[resolution].w,
          minHeight: resolutions[resolution].h,
          maxWidth: resolutions[resolution].w,
          maxHeight: resolutions[resolution].h
        },
      }
    }
  };

  navigator.mediaDevices.getUserMedia(constraints[constraint]).then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    // Take a screenshot
    printButton.onclick = async () => {
      if (constraint === "camera" || constraint === "cameraNoAudio") {
        await countdown(3);
      } else {
        if (process.platform === "linux") {
          await countdown(3);
        } else {
          appWindow.setOpacity(0);
        }
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext('2d');

      canvas.width = resolutions[resolution].w;
      canvas.height = resolutions[resolution].h;

      context.drawImage(video, 0, 0, resolutions[resolution].w, resolutions[resolution].h);

      if (saveTo === "clipboard") {
        await clipboard.writeImage(nativeImage.createFromDataURL(canvas.toDataURL("image/png")));
        modal('Copied!', "#4faf4f", "white");
      } else if (saveTo === "file") {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement('a');
        a.style.display = "none";
        a.href = url;
        a.download = "image.png";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
        modal('Saved!', "#4faf4f", "white");

        setTimeout(() => {
          if (constraint !== "camera" || constraint !== "cameraNoAudio" && process.platform !== "linux") appWindow.setOpacity(1);
        }, 100);
      }
    }
  
    // Toggle recording
    recordButton.onclick = async () => {
      if (isRecording) {
        mediaRecorder.stop();
        
        anime({
          targets: '.recordIcon',
          borderRadius: '50%',
          duration: 100,
          easing: 'easeInOutQuad'
        });

        anime({
          targets: '#record',
          backgroundColor: '#4faf4f',
          duration: 100,
          easing: 'easeInOutQuad'
        });

        isRecording = false;
      } else {
        await countdown(3);

        mediaRecorder.start();
        
        anime({
          targets: '.recordIcon',
          borderRadius: '20%',
          duration: 100,
          easing: 'easeInOutQuad'
        });

        anime({
          targets: '#record',
          backgroundColor: '#ff4f4f',
          duration: 100,
          easing: 'easeInOutQuad'
        });

        isRecording = true;
      }
    }
  
    // Handle recorded media, on stop
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { 'type' : 'video/mp4; codecs=opus' });
      const url = URL.createObjectURL(blob);
  
      chunks = [];

      modal('Saved!', "#4faf4f", "white");
  
      const a = document.createElement('a');
      a.style.display = "none";
      a.href = url;
      a.download = "video.mp4";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  
    // Chunky chunky pushy pushy
    mediaRecorder.ondataavailable = event => {
      chunks.push(event.data);
    }
  
    // Going live in 3.. 2.. 1..
    try {
      video.srcObject = stream;
    } catch (error) {
      video.src = URL.createObjectURL(stream);
    }
  }).catch(err => {
    // Oopsie doopise.
    console.error(err);
    alert(`Couldn't assign stream object: ${err}`);
  });
}

// Settings thingy
Object.keys(resolutions).forEach(res => {
  const option = document.createElement('option');
  option.value = res;
  option.innerText = res;
  selects.video.resolution.appendChild(option.cloneNode(true));
  selects.photo.resolution.appendChild(option);
});

Object.keys(constraintValues).forEach(res => {
  const option = document.createElement('option');
  option.value = res;
  option.innerText = constraintValues[res];
  selects.video.constraint.appendChild(option.cloneNode(true));
  selects.photo.constraint.appendChild(option);
});

Object.keys(saveToValues).forEach(res => {
  const option = document.createElement('option');
  option.value = res;
  option.innerText = saveToValues[res];
  selects.photo.saveTo.appendChild(option);
});

selects.video.resolution.addEventListener('change', event => {
  resolution = Object.keys(resolutions)[event.target.selectedIndex];
  localStorage.resolution = resolution;
  location.reload();
});

selects.video.constraint.addEventListener('change', event => {
  constraint = Object.keys(constraintValues)[event.target.selectedIndex];
  localStorage.constraint = constraint;
  location.reload();
});

selects.photo.resolution.addEventListener('change', event => {
  resolution = Object.keys(resolutions)[event.target.selectedIndex];
  localStorage.resolution = resolution;
  location.reload();
});

selects.photo.constraint.addEventListener('change', event => {
  constraint = Object.keys(constraintValues)[event.target.selectedIndex];
  localStorage.constraint = constraint;
  location.reload();
});

selects.photo.saveTo.addEventListener('change', event => {
  saveTo = Object.keys(saveToValues)[event.target.selectedIndex];
  localStorage.saveTo = saveTo;
});

// Haha light theme go brr
themeButton.addEventListener('click', () => {
  if (theme === "light") {
    theme = "dark";
  } else if (theme === "dark") {
    theme = "light";
  }

  localStorage.theme = theme;

  document.querySelector('#stylesheet').href = `style-${theme}.css`;
});

document.querySelector('#stylesheet').href = `style-${theme}.css`;

// Mediay Tabey Buttoney
options.video.addEventListener('click', () => {
  videoOptions.style.display = "flex";
  photoOptions.style.display = "none";
  options.video.classList.add("selected");
  options.photo.classList.remove("selected");

  localStorage.mediaType = "video";
});

options.photo.addEventListener('click', () => {
  photoOptions.style.display = "flex";
  videoOptions.style.display = "none";
  options.photo.classList.add("selected");
  options.video.classList.remove("selected");

  localStorage.mediaType = "photo";
});

// Value definition
selects.video.resolution.value = localStorage.resolution || "720p";
selects.video.constraint.value = localStorage.constraint || "desktop";
selects.photo.resolution.value = localStorage.resolution || "720p";
selects.photo.constraint.value = localStorage.constraint || "desktop";
selects.photo.saveTo.value = localStorage.saveTo || "clipboard";
options[mediaType].click();

assignVideo();
feather.replace();