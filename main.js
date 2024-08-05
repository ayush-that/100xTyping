import { Analytics } from "@vercel/analytics";

var input = document.getElementById("terminal-input");
var content = document.getElementById("terminal-content");

const o = "&nbsp;";
const commandList = ["help", "welcome", "start", "reset", "stats", "clear"];
const helpCmds = [
  `<strong>------ ✨ Typing Test Commands ✨ ------</strong><br>`,
  `<span id='faint-glow-purple' class='term-purple'>help</span>     ${o}${o}${o}${o}${o}${o}${o}${o}   📜 Displays this message <br>`,
  `<span id='faint-glow-purple' class='term-purple'>welcome</span>  ${o}${o}${o}${o}${o}               🎉 Displays the welcome message <br>`,
  `<span id='faint-glow-purple' class='term-purple'>start</span>    ${o}${o}${o}${o}${o}${o}${o}       🚀 Start the typing test <br>`,
  `<span id='faint-glow-purple' class='term-purple'>reset</span>    ${o}${o}${o}${o}${o}${o}${o}       🔄 Reset the typing test <br>`,
  `<span id='faint-glow-purple' class='term-purple'>stats</span>    ${o}${o}${o}${o}${o}${o}${o}       📊 View typing test statistics <br>`,
  `<span id='faint-glow-purple' class='term-purple'>clear</span>    ${o}${o}${o}${o}${o}${o}${o}       🧹 Clears the terminal <br>`,
];
const welcomeMsg = [
  `Welcome to <span id="term-green" class="faint-glow-green">100xtyping</span> <br>`,
  `Type <span id="term-green" class="faint-glow-green">'help'</span> for the list of available commands.<br>`,
];
const resetMsg = [
  `🔄 The typing test has been reset. Type <span id="term-green" class="faint-glow-green">'start'</span> to begin again.`,
];
let testStartTime, testEndTime;
let isTesting = false;
let testText = "";
let typingTestResults = [];

const typingTestParagraphs = [
  "the quick brown fox jumps over the lazy dog every day",
  "she sells seashells by the seashore near the sandy beach",
  "how much wood would a woodchuck chuck if it could",
  "a journey of a thousand miles begins with a single step",
  "to be or not to be that is the question always",
  "every good boy deserves fudge and every girl likes candy",
  "a rolling stone gathers no moss and stays always moving fast",
  "an apple a day keeps the doctor away from the sick",
  "the early bird catches the worm and gets the best start",
  "if you can't beat them join them and make it right",
];

function getRandomParagraph() {
  const randomIndex = Math.floor(Math.random() * typingTestParagraphs.length);
  return typingTestParagraphs[randomIndex];
}

function calculateAccuracy(expectedText, typedText) {
  let correctChars = 0;
  let totalChars = expectedText.length;

  for (let i = 0; i < totalChars; i++) {
    if (typedText[i] === expectedText[i]) {
      correctChars++;
    }
  }

  return (correctChars / totalChars) * 100;
}

const terminal = {
  echo: async function (
    text,
    delay,
    startNewLine = true,
    endNewLine = true,
    isAwaited = false,
    inputField = content
  ) {
    let index = 0;
    if (startNewLine) {
      inputField.innerHTML += "<br>";
    }
    terminal.hide();
    terminal.disable();
    const inputInterval = setInterval(async function () {
      if (isAwaited) {
        inputField.innerHTML += await text[index];
      }
      if (!isAwaited) {
        inputField.innerHTML += text[index];
      }
      index++;
      ScrollTo("bottom");
      if (index === text.length) {
        clearInterval(inputInterval);
        if (endNewLine) {
          content.innerHTML += "<br>";
        }
        terminal.show();
        terminal.enable();
        input.focus();
      }
    }, delay);
  },

  autofocus: function () {
    if (input.hasAttribute("onblur")) {
      input.removeAttribute("onblur");
    } else {
      input.setAttribute("onblur", "FocusInput()");
    }
  },

  enable: function () {
    document.getElementById("terminal-input").removeAttribute("disabled", "");
  },

  disable: function () {
    document.getElementById("terminal-input").setAttribute("disabled", "");
  },

  show: function () {
    document.getElementById("path").removeAttribute("class", "invisible");
  },

  hide: function () {
    document.getElementById("path").setAttribute("class", "invisible");
  },
};

input.addEventListener("keydown", HandleCommands);

function ScrollTo(direction) {
  if (direction === "top") {
    window.scrollTo(0, 0);
  }
  if (direction === "bottom") {
    window.scrollTo(0, document.body.scrollHeight);
  }
}

function FocusInput() {
  setTimeout(() => {
    input.focus();
  }, 25);
}

function ExecuteWelcomeCommandOnLoad() {
  let index = 0;
  let text = welcomeMsg;
  let delay = 25;

  const inputInterval = setInterval(function () {
    content.innerHTML += text[index];
    index++;
    if (index === text.length) {
      clearInterval(inputInterval);
    }
  }, delay);

  ScrollTo("top");
  document.getElementById("terminal-welcome-loading-text").innerText =
    "👋 Welcome";
  document.getElementById("terminal").removeAttribute("class");
  input.removeAttribute("disabled");
  input.focus();
}

function HandleCommands(event) {
  if (event.key === "Enter") {
    const command = input.value.trim();
    input.value = "";
    content.innerHTML += `<br><span id="term-orange">visitor</span>@<span id="term-green">100xtyping.ayush.top</span>:~$ ${command} <br>`;
    ExecuteCommand(command);
  }
}

function ExecuteCommand(command) {
  switch (command) {
    case "help":
      terminal.echo(helpCmds, 10, false, true);
      break;
    case "welcome":
      terminal.echo(welcomeMsg, 25, false, true);
      break;
    case "start":
      if (!isTesting) {
        isTesting = true;
        testText = getRandomParagraph();
        testStartTime = new Date().getTime();
        const startMsg = [
          `🚀 Starting the typing test...<br>`,
          `Type the following text as fast as you can:<br>`,
          `<span id="test-text">${testText}</span><br>`,
          `Press Enter when you are done.`,
        ];
        terminal.echo(startMsg, 25, false, true);
      } else {
        terminal.echo(["✏️ Typing test already in progress."], 25, false, true);
      }
      break;
    case "reset":
      isTesting = false;
      testText = "";
      terminal.echo(resetMsg, 25, false, true);
      break;
    case "stats":
      let totalWpm = 0;
      typingTestResults.forEach((result) => {
        totalWpm += result.wpm;
      });
      let averageWpm =
        typingTestResults.length > 0 ? totalWpm / typingTestResults.length : 0;

      // Display all attempts
      const attemptsList = typingTestResults
        .map(
          (result, index) =>
            `Attempt ${index + 1}: WPM: ${result.wpm.toFixed(2)}`
        )
        .join("<br>");

      const statsMsg = [
        `📊 Typing Test Statistics:<br>`,
        `Attempts: ${typingTestResults.length}<br>`,
        `Average Words per minute (WPM): <span id="wpm">${averageWpm.toFixed(
          2
        )}</span><br>`,
        `All Attempts:<br>${attemptsList}`,
      ];
      terminal.echo(statsMsg, 25, false, true);
      break;
    case "clear":
      content.innerHTML = "";
      break;
    default:
      if (isTesting) {
        const typedText = command.trim();
        const accuracy = calculateAccuracy(testText, typedText);
        if (accuracy === 100) {
          testEndTime = new Date().getTime();
          let timeDiff = (testEndTime - testStartTime) / 1000; // in seconds
          let wpm = (testText.split(" ").length / timeDiff) * 60;
          typingTestResults.push({ wpm, accuracy });
          terminal.echo(
            [
              `✅ Typing test completed. WPM: ${wpm.toFixed(
                2
              )}, Accuracy: ${accuracy.toFixed(2)}%`,
            ],
            25,
            false,
            true
          );
          isTesting = false; // Reset the flag after successful completion
          testText = ""; // Clear the test text
        } else {
          terminal.echo(
            [`❌ Incorrect text. Accuracy: ${accuracy.toFixed(2)}%`],
            25,
            false,
            true
          );
          // Allow user to correct their text and try again without resetting the flag
        }
      } else {
        terminal.echo([`❓ Unknown command: ${command}`], 25, false, true);
      }
      break;
  }
}

Analytics();
