# What is PlayedIt?
PlayedIt is a MERN stack project designed for UCF's Processes in Object Oriented Software Development (POOSD) course utilizing a React/Vite framework. This website and app allows for the gaming community to have a place to rate games of every console both big and small and indi developers to showcase their games next to the AAA giants of the industry. It showcases a language model used for recommending games an individual user may enjoy as well as our team's skills in building a react/vite full stack application with JavaScript, C++, HTML, and CSS in both a web and mobile application.

# Where can our project be viewed live?
https://playedit.games/ 

# How To Run The Main Website Locally If It Is Not Live
You will need the following commands entered into your computer's terminal or runtime environment(such as VS Studios) as well as installing node.js from https://nodejs.org/en/download and a browser of your choice
  - ```npm install```
  - ```npm -v```
  - ```npm install react-router-dom```
  - Download project files
  - Open 2 terminal windows (one for frontend and one for backend)
  - In the first terminal ```cd (local file path of POOSD-Large-Project Frontend)```
  - ```npm run dev```
  - In the second terminal ```cd (local file path of POOSD-Large-Project Backend)```
  - ```npm run dev```
  - In your browser of choice, search for ```http://localhost:8080``` and view the project from there

# How To Emulate the IOS & Android Apps
For the emulation of the iOS and Android Apps there are two different pathways depending on which platform you're building for.

For iOS:
  - Install XCode
  - Open XCode and agree to the license.
  - Install Command Line Tools
      - ```xcode-select --install```
      - Follow the prompt to install.
  - Open Xcode -> Settings -> Platforms -> iOS to ensure the latest iOS runtime is installed as that check is needed for the digital iPhone simulator to launch.

For Android:
  - Install the Android Studio IDE
  - During setup, make sure these are checked:
      - Android SDK
      - Android SDK Platform
      - Android Virtual Device (AVD)
  - Once all of the above is completed, open Android Studio and create at least one emulator to test simulator functionality.

Next (working in Flutter now):
  - Install the Flutter SDK
  - Add the Flutter SDK to your PATH (mini-process):
      - On MacOS:
        - Open Terminal
        - Edit your shell configuration file depending on your shell:

        - For zsh (default on macOS Catalina+ (check by heading into pressing Apple Logo -> About this Mac -> More Info -> Scroll Down to MacOS):
          - Paste in ```nano ~/.zshrc``` in Terminal

        - For bash:
          - Paste in ```nano ~/.bash_profile``` in Terminal
        - Add this line to the end in between the other ```PATH=```s
          - ```export PATH="$PATH:$HOME/development/flutter/bin"``` in Terminal
          - Replace ```$HOME/development/flutter/bin``` with the actual path where you unzipped Flutter.
          - For example, if you put Flutter in Downloads/flutter, the line would be export ```PATH="$PATH:$HOME/Downloads/flutter/bin"```.
          - Use Ctrl+O to Save, Ctrl+X to Exit.
        - Apply the changes by running ```source ~/.zshrc``` or ```source ~/.bash_profile``` in Terminal.
        - Test functionality by running ```flutter --version``` in Terminal.
        - Flutter’s version info/type should print out.
  - Run in Terminal:
      - ```flutter doctor``` to ensure version installed correctly and platform functionality.
  - Clone our repo.
  - Run in Terminal:
      - ```flutter pub get``` to compile the repo build on your computer.

Simulating the App Now:
  - For the iOS Simulator:
      - Run ```open -a Simulator``` in Terminal
      - Select Hardware -> Device -> Device You Want to start the emulator.
      - Wait for the emulator to open on your screen.
  - For the Android Simulator:
      - Go to Tools -> Device Manager -> Start, which should start up your device chosen from before, or go to Flutter Attach to choose a new device.
  - Finally, for the App to Appear on Either Loaded Simulator, Run in Terminal:
      - ```flutter run```
      - Your app should run!
      - Please note that the XCode build may take time to run the first time or various other times as the app gets bigger, but it will never exceed more than a minute or two for this repo.

# APP SPOILERS BELOW:




# Note for Playing the FreeDOOM Port Called to In Our App
Before you start playing, you must use a keyboard and press the "Esc" key to start accessing the menu and playing the game. 
The port is made for keyboard controls and touch controls are outside the bounds of what the port can understand.
Hope you have fun! Thank you for your time.
