#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const exec = require('child_process');
const util = require("util");
const download = require("download-git-repo");
const githubDownload = util.promisify(download);

// grab arguments
const args = process.argv.slice(2);
const projectLocation = args[0] && args[0].trim();
const withInstall = args[1] === "-n" && "--noinstall" ? false : true;

const main = async () => {
    // check that there is a project location provided
    if (!projectLocation) {
        console.log("Please specify a project directory:\nFor example:\n  lean-react-app my-react-app");
        return;
    }

    // project path and name
    const projectPath = path.join(process.cwd(), projectLocation);
    const projectName =
        projectLocation === "."
            ? path.basename(projectPath)
            : path.basename(projectLocation);

    console.log("Project path: " + projectPath + "\nProject name: " + projectName);

    // create folder if it does not exist
    const folderExists = fs.existsSync(projectPath);
    if (!folderExists) {
        process.stdout.write("Creating directory...");
        fs.mkdirSync(projectPath, { recursive: true });
        process.stdout.write(" DONE\n");
    }

    // initiate project
    process.stdout.write("Downloading template project...");
    await githubDownload("pawlo0/lean-react-app-template", projectPath);
    process.stdout.write(" DONE\n\n");


    // change package.json
    const pkgJsonPath = path.join(projectPath, "package.json");
    const packageJSON = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const newPackageJSON = {
        ...packageJSON,
        name: projectName,
        description: "",
        scripts: { ...packageJSON.scripts, start: "parcel index.html --port 3000" }
    }

    fs.writeFileSync(
        pkgJsonPath,
        JSON.stringify(newPackageJSON, null, 2),
        "utf8",
    );



    // Install packages
    if (withInstall) {
        process.chdir(projectPath);
        exec.execSync('npm install', { stdio: [0, 1, 2] });

    }

}

main()