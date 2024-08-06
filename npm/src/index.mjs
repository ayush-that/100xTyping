#!/usr/bin/env node

import readline from "readline";
import fs from "fs/promises";
import gradient from "gradient-string";
import figlet from "figlet";
import chalk from "chalk";
import chalkAnimation from "chalk-animation";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green("100xDev@100xtyping:~$ "),
});

const commands = ["help", "welcome", "start", "reset", "stats", "clear"];
const helpCmds = `
------ ✨ ${chalk.blue("Typing Test Commands")} ✨ ------
${chalk.green("help")}     📜 Displays this message
${chalk.green("welcome")}  🎉 Displays the welcome message
${chalk.green("start")}    🚀 Start the typing test
${chalk.green("reset")}    🔄 Reset the typing test
${chalk.green("stats")}    📊 View typing test statistics
${chalk.green("clear")}    🧹 Clears the terminal
`;
const welcomeMsg = `
Welcome to ${chalk.green("100xtyping")}
Type ${chalk.green("'help'")} for the list of available commands.
`;
const resetMsg = `🔄 The typing test has been reset. Type ${chalk.green(
  "'start'"
)} to begin again.`;

let testStartTime, testEndTime;
let isTesting = false;
let testText = "";
let typingTestResults = [];

async function fetchWords() {
  const data = await fs.readFile("src/words.json", "utf8");
  return JSON.parse(data);
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

function calculateAccuracy(expectedText, typedText) {
  let correctChars = 0;
  let totalChars = Math.max(expectedText.length, typedText.length);

  for (let i = 0; i < totalChars; i++) {
    if (typedText[i] === expectedText[i]) {
      correctChars++;
    }
  }

  return (correctChars / totalChars) * 100;
}

function startTypingTest() {
  isTesting = true;
  getRandomWords().then((words) => {
    testText = words;
    testStartTime = new Date().getTime();
    console.log(
      `🚀 Starting the typing test...\nType the following text as fast as you can:\n${chalk.yellow(
        testText
      )}\nPress Enter when you are done.`
    );
  });
}

function showStats() {
  let totalWpm = 0;
  typingTestResults.forEach((result) => {
    totalWpm += result.wpm;
  });
  let averageWpm =
    typingTestResults.length > 0 ? totalWpm / typingTestResults.length : 0;

  const attemptsList = typingTestResults
    .map(
      (result, index) => `Attempt ${index + 1}: WPM: ${result.wpm.toFixed(2)}`
    )
    .join("\n");

  console.log(
    `📊 Typing Test Statistics:\nAttempts: ${
      typingTestResults.length
    }\nAverage Words per minute (WPM): ${chalk.cyan(
      averageWpm.toFixed(2)
    )}\nAll Attempts:\n${attemptsList}`
  );
}

function showWelcomeMessage() {
  figlet("100xTyping", (err, data) => {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(gradient.pastel.multiline(data));
    chalkAnimation.rainbow(welcomeMsg).start();
  });
}

showWelcomeMessage();

rl.prompt();

rl.on("line", (line) => {
  const command = line.trim();

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
      console.log(
        `✅ Typing test completed. WPM: ${chalk.green(
          wpm.toFixed(2)
        )}, Accuracy: ${chalk.green(
          accuracy.toFixed(2)
        )}%\nDo you want to continue? Type 'start' for another test or 'reset' to reset.`
      );
      isTesting = false;
      testText = "";
    } else {
      console.log(
        `❌ Incorrect text. Accuracy: ${chalk.red(
          accuracy.toFixed(2)
        )}%\nResetting test...`
      );
      setTimeout(() => {
        console.log(resetMsg);
      }, 1000);
    }
  } else {
    switch (command) {
      case "help":
        console.log(helpCmds);
        break;
      case "welcome":
        console.log(welcomeMsg);
        break;
      case "start":
        if (!isTesting) {
          startTypingTest();
        } else {
          console.log("✏️ Typing test already in progress.");
        }
        break;
      case "reset":
        isTesting = false;
        testText = "";
        console.log(resetMsg);
        break;
      case "stats":
        showStats();
        break;
      case "clear":
        console.clear();
        break;
      default:
        if (!isTesting) {
          console.log(`❓ Unknown command: ${chalk.red(command)}`);
        }
        break;
    }
  }

  rl.prompt();
}).on("close", () => {
  console.log("Have a great day!");
  process.exit(0);
});
