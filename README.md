# Visual Studio Quartus (VSQ)
An extension for Visual Studio Code that can perform all basic quartus, platform designer, and eclipse functionalities.

## How to run (dev environment):
1. Clone Repo
2. Run `npm install`
3. Ensure the `intelFPGA_lite > 18.1 > quartus > bin64` folder is in your PATH.
4. Open VSCode in the directory of this repo
5. Press F5 to run the extension, and open the dev environment.


## Current Functionality
### Create New Project
When you open the VSQ tab in VSCode, you will be prompted to make a new project. 
Currently, you input the following information:
- Project Name (no spaces)
- Device Family (Currently only support for MAX10)
- Part Number (Currently only support for 10M50DAF484C7G)

This will create a basic quartus project, and set the device for you.

### Open existing project
Currently, the extension only knows if a quartus project exists if there is a `.quartus` folder. This is a mega WIP, and will be altered very soon.

