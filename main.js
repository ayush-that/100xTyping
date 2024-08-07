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

async function fetchWords() {
  const response = await fetch("words.json");
  const words = await response.json();
  return words;
}

async function getRandomWords() {
  const words = await fetchWords();
  const wordKeys = Object.keys(words);
  let randomWords = [];
  while (randomWords.length < 10) {
    const randomIndex = Math.floor(Math.random() * wordKeys.length);
    const randomWord = words[wordKeys[randomIndex]];
    if (!randomWords.includes(randomWord)) {
      randomWords.push(randomWord);
    }
  }
  return randomWords.join(" ");
}

function longestCommonSubsequenceLength(expectedText, typedText) {
  const memo = new Array(expectedText.length + 1).fill(null).map(() => new Array(typedText.length + 1).fill(-1));

  function lcsHelper(i, j) {
      if (i === 0 || j === 0) return 0;

      if (memo[i][j] !== -1) return memo[i][j];

      if (expectedText[i - 1] === typedText[j - 1])
          memo[i][j] = 1 + lcsHelper(i - 1, j - 1);
      else
          memo[i][j] = Math.max(lcsHelper(i - 1, j), lcsHelper(i, j - 1));

      return memo[i][j];
  }

  lcsHelper(expectedText.length, typedText.length);

  let i = expectedText.length, j = typedText.length;
  let longestCommonSubsequence = "";

  while (i > 0 && j > 0) {
      if (expectedText[i - 1] === typedText[j - 1]) {
          longestCommonSubsequence = expectedText[i - 1] + longestCommonSubsequence;
          i--;
          j--;
      } else if (memo[i - 1][j] > memo[i][j - 1])
          i--;
      else
          j--;
  }

  return longestCommonSubsequence.length;
}

function calculateAccuracy(expectedText, typedText) {
  return (longestCommonSubsequenceLength(expectedText, typedText) / expectedText.length) * 100;
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

async function HandleCommands(event) {
  if (event.key === "Enter") {
    const command = input.value.trim();
    input.value = "";
    content.innerHTML += `<br><span id="term-orange">100xDev</span>@<span id="term-green">100xtyping.ayush.top</span>:~$ ${command} <br>`;
    await ExecuteCommand(command);
  }
}

async function ExecuteCommand(command) {
  if (
    isTesting &&
    command !== "reset" &&
    command !== "help" &&
    command !== "clear" &&
    command !== "stats"
  ) {
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
          )}, Accuracy: ${accuracy.toFixed(2)}%<br>`,
          `Do you want to continue? Press <span id="term-green">'y'</span> for another test or <span id="term-red">'n'</span> to stop.`,
        ],
        25,
        false,
        true
      );
      isTesting = false;
      testText = "";
    } else {
      terminal.echo(
        [
          `❌ Incorrect text. Accuracy: ${accuracy.toFixed(
            2
          )}%<br>Resetting test...`,
        ],
        25,
        false,
        true
      );
      setTimeout(() => {
        ExecuteCommand("reset");
      }, 1000);
    }
  } else {
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
          testText = await getRandomWords();
          testStartTime = new Date().getTime();
          const startMsg = [
            `🚀 Starting the typing test...<br>`,
            `Type the following text as fast as you can:<br>`,
            `<span id="test-text">${testText}</span><br>`,
            `Press Enter when you are done.`,
          ];
          terminal.echo(startMsg, 25, false, true);
        } else {
          terminal.echo(
            ["✏️ Typing test already in progress."],
            25,
            false,
            true
          );
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
          typingTestResults.length > 0
            ? totalWpm / typingTestResults.length
            : 0;

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
      case "y":
        if (!isTesting) {
          ExecuteCommand("start");
        }
        break;
      case "n":
        terminal.echo(["👍 Test session ended."], 25, false, true);
        break;
      default:
        if (!isTesting) {
          terminal.echo([`❓ Unknown command: ${command}`], 25, false, true);
        }
        break;
    }
  }
}
