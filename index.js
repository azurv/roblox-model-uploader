const noblox = require('noblox.js');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')({ sigint: true });
const { exec } = require('child_process');

// Custom color functions
const color = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
};

// Function to read cookies from cookies.txt with blank lines
function readCookiesFromFile() {
  try {
    const data = fs.readFileSync(path.join('cookies', 'cookies.txt'), 'utf8');
    return data.split('\n').map(cookie => cookie.trim()).filter(cookie => cookie !== '');
  } catch (err) {
    logError(err);
    return [];
  }
}

// Function to log errors to errors.txt
function logError(error) {
  const date = new Date().toISOString();
  fs.appendFileSync(path.join('cookies', 'errors.txt'), `[${date}] ${error}\n`);
}

// Function to display loading animation
function showLoadingAnimation(duration) {
  process.stdout.write(color.cyan('Loading'));
  let dots = 0;
  const interval = setInterval(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(color.cyan('Loading' + '.'.repeat(dots)));
    dots = (dots + 1) % 4;
  }, 200);

  return new Promise(resolve => setTimeout(() => {
    clearInterval(interval);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.clear();
    displayHeader();
    resolve();
  }, duration));
}

// Function to display header
function displayHeader() {
  console.log(color.yellow(`
+----------------------------------+
|  Roblox Model Uploader           |
|                                  |
|  https://github.com/azurv        |
|                                  |
|  https://azdev.cc/               |
+----------------------------------+
  `));
}

// Function to get random model file from models directory
function getRandomModelFile() {
  const modelsDir = 'models';
  const files = fs.readdirSync(modelsDir);
  const modelFiles = files.filter(file => path.extname(file) === '.rbxm');
  return path.join(modelsDir, getRandomElement(modelFiles));
}

// Function to select a random element from an array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Function to handle the "Cookie Refresher" option
async function cookieRefresher() {
  const cookies = readCookiesFromFile();
  let userDetails = [];

  // Retrieve user details for each cookie
  for (let i = 0; i < cookies.length; i++) {
    try {
      const user = await noblox.setCookie(cookies[i]);
      userDetails.push({
        cookie: cookies[i],
        username: user.UserName,
        userid: user.UserID
      });
    } catch {
      userDetails.push({
        cookie: cookies[i],
        username: 'Invalid',
        userid: 'Invalid'
      });
    }
  }

  // Display user details with numbers
  console.log(color.cyan('Select a user to refresh their cookie:'));
  userDetails.forEach((user, index) => {
    console.log(color.yellow(`[${index + 1}] ${user.username} (${user.userid})`));
  });
  console.log(color.magenta('[ALL] Refresh all cookies'));

  // Prompt user to select a number or 'ALL'
  const choice = prompt('Enter the number or "ALL": ').toUpperCase();

  if (choice === 'ALL') {
    const confirm = prompt(color.red('Are you sure you want to refresh all cookies? (yes/no): ')).toLowerCase();
    if (confirm === 'yes') {
      for (let i = 0; i < userDetails.length; i++) {
        const user = userDetails[i];
        if (user.username !== 'Invalid') {
          try {
            const newCookie = await noblox.refreshCookie(user.cookie);
            userDetails[i].cookie = newCookie; // Update the cookie in userDetails array
            const date = new Date().toISOString();
            const refreshedEntry = `${newCookie} - ${user.username} (${user.userid}) - ${date}\n`;
            fs.appendFileSync(path.join('cookies', 'refreshedcookies.txt'), refreshedEntry);
            console.log(color.green(`Cookie refreshed and saved for ${user.username}`));
          } catch (error) {
            logError(`Error refreshing cookie for ${user.username}: ${error}`);
          }
        } else {
          console.log(color.red(`Cannot refresh cookie for an invalid user (${user.username}).`));
        }
      }
      // Update the cookies.txt file with refreshed cookies
      const refreshedCookies = userDetails.map(user => user.cookie).join('\n');
      fs.writeFileSync(path.join('cookies', 'cookies.txt'), refreshedCookies);
    } else {
      console.log(color.red('Operation canceled.'));
    }
  } else {
    const selectedIndex = parseInt(choice, 10) - 1;
    if (selectedIndex >= 0 && selectedIndex < userDetails.length) {
      const selectedUser = userDetails[selectedIndex];
      if (selectedUser.username !== 'Invalid') {
        try {
          const newCookie = await noblox.refreshCookie(selectedUser.cookie);
          userDetails[selectedIndex].cookie = newCookie; // Update the cookie in userDetails array
          const date = new Date().toISOString();
          const refreshedEntry = `${newCookie} - ${selectedUser.username} (${selectedUser.userid}) - ${date}\n`;
          fs.appendFileSync(path.join('cookies', 'refreshedcookies.txt'), refreshedEntry);
          console.log(color.green(`Cookie refreshed and saved: ${refreshedEntry}`));
          // Update the cookies.txt file with refreshed cookies
          const refreshedCookies = userDetails.map(user => user.cookie).join('\n');
          fs.writeFileSync(path.join('cookies', 'cookies.txt'), refreshedCookies);
        } catch (error) {
          logError(`An error occurred while refreshing the cookie for ${selectedUser.username}: ${error}`);
        }
      } else {
        console.log(color.red('Cannot refresh cookie for an invalid user.'));
      }
    } else {
      console.log(color.red('Invalid selection.'));
    }
  }
}

// Function to handle the "Cookie Checker" option
async function cookieChecker() {
  const cookies = readCookiesFromFile();
  let workingCookies = [];
  let nonWorkingCookies = [];

  for (let i = 0; i < cookies.length; i++) {
    try {
      const user = await noblox.setCookie(cookies[i]);
      workingCookies.push(`${cookies[i]} - ${user.UserName} (${user.UserID})`);
    } catch (error) {
      nonWorkingCookies.push(cookies[i]);
      logError(`Invalid cookie: ${cookies[i]}`);
    }
  }

  fs.writeFileSync(path.join('cookies', 'working_cookies.txt'), workingCookies.join('\n'));
  fs.writeFileSync(path.join('cookies', 'non_working_cookies.txt'), nonWorkingCookies.join('\n'));
  console.log(color.green(`Checked ${cookies.length} cookies.`));
  console.log(color.green(`Working: ${workingCookies.length}`));
  console.log(color.red(`Non-Working: ${nonWorkingCookies.length}`));
}

// Function to handle the "Upload Model" option
async function uploadModel() {
  const cookies = readCookiesFromFile();
  const modelCount = parseInt(prompt('How many models do you want to upload? '), 10);
  const accountCount = parseInt(prompt('How many accounts to use? '), 10);
  const selectedCookies = cookies.slice(0, accountCount);
  let totalUploads = 0;

  try {
    for (let i = 0; i < modelCount; i++) {
      const cookie = selectedCookies[i % selectedCookies.length];
      const user = await noblox.setCookie(cookie);
      console.log(color.green(`Logged in as ${user.UserName}`));

      const randomModelPath = getRandomModelFile();
      const modelData = fs.readFileSync(randomModelPath);

      const modelName = encodeURIComponent(path.basename(randomModelPath, '.rbxm'));
      const modelDescription = `${modelName} model`;

      const { assetId } = await noblox.uploadModel(modelData, {
        name: modelName,
        description: modelName,
        copyLocked: false,
        allowComments: false,
        groupId: undefined
      });

      console.log(color.green(`Uploaded model: Asset ID: ${assetId} | User: ${user.UserName}`));
      totalUploads++;
      console.log(color.green(`Total uploads: ${totalUploads}`));

      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  } catch (error) {
    logError(`An error occurred: ${error}`);
    console.log(color.green(`Total uploads: ${totalUploads}`));
  }
}

// Main function to display the menu and handle user input
function displayMenu() {
  console.clear();
  displayHeader();
  console.log(color.cyan('[1] Cookie Refresher'));
  console.log(color.cyan('[2] Cookie Checker'));
  console.log(color.cyan('[3] Upload Model'));
  console.log(color.cyan('[0] Exit'));

  const choice = prompt('Enter your choice: ');

  switch (choice) {
    case '1':
      console.clear();
      displayHeader();
      cookieRefresher().then(() => {
        showLoadingAnimation(2000).then(displayMenu);
      });
      break;
    case '2':
      console.clear();
      displayHeader();
      cookieChecker().then(() => {
        showLoadingAnimation(5000).then(displayMenu);
      });
      break;
    case '3':
      console.clear();
      displayHeader();
      uploadModel().then(() => {
        showLoadingAnimation(2000).then(displayMenu);
      });
      break;
    case '0':
      console.log(color.green('Exiting...'));
      exec('taskkill /F /IM node.exe', (err, stdout, stderr) => {
        if (err) {
          logError(`Error killing task: ${err}`);
        }
        console.log(stdout);
        console.error(stderr);
      });
      break;
    default:
      console.log(color.red('Invalid choice. Please try again.'));
      setTimeout(displayMenu, 2000);
      break;
  }
}

displayMenu();
