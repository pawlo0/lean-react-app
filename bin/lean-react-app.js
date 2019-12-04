#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const exec = require('child_process');

// grab arguments
const args = process.argv.slice(2);
const projectLocation = args[0] && args[0].trim();

const main = () => {
    // check that there is a project location provided
    if (!projectLocation) {
        console.log("Please specify a project directory:\nFor example:\n  nano-react-app my-react-app");
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
        fs.mkdirSync(projectPath + "/src/components", { recursive: true });
        process.stdout.write(" DONE\n");
    }

    // initiate project
    process.chdir(projectPath);
    exec.execSync('npm init -y', { stdio: [0, 1, 2] });

    // Install packages
    exec.execSync('npm install --save react react-dom', { stdio: [0, 1, 2] });
    exec.execSync('npm install --save-dev parcel-bundler @babel/preset-react @babel/plugin-proposal-class-properties', { stdio: [0, 1, 2] });


    // change package.json
    const packageJSON = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    const newPackageJSON = {
        ...packageJSON,
        name: projectName,
        description: "",
        scripts: { ...packageJSON.scripts, start: "parcel index.html --port 3000" }
    }

    fs.writeFileSync(
        "./package.json",
        JSON.stringify(newPackageJSON, null, 2),
        "utf8",
    );


    // make .babelrc
    const babelrc = {
        presets: ["@babel/preset-react"],
        plugins: [
            ["@babel/plugin-proposal-class-properties", { loose: true }],
            ["@babel/plugin-transform-react-jsx", { pragmaFrag: "React.Fragment" }]
        ]
    }

    fs.writeFileSync(
        "./.babelrc",
        JSON.stringify(babelrc, null, 2),
        "utf8",
    );


    // make index.html
    const title = projectName.replace(/([A-Z])/g, " $1");
    const finalTitle = title.charAt(0).toUpperCase() + title.slice(1);

    fs.writeFileSync(
        "./index.html",
        `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>${finalTitle}</title>
</head>
<body>
	<div id="root"></div>
	<script src="./src/index.js"></script>
</body>
</html>`,
        "utf8"
    );

    // make index.js
    fs.writeFileSync(
        "./src/index.js",
        `import React from "react"
import ReactDOM from "react-dom";
import App from "./components/App";
ReactDOM.render(<App />, document.getElementById("root"));`,
        "utf8"
    );

    // make App.js
    fs.writeFileSync(
        "./src/components/App.js",
        `import React from "react";
const App = () => <div>A simple and lean react template.</div>;
export default App;`,
        "utf8"
    );


    // make README.md
    fs.writeFileSync(
        "./README.md",
        `# ${finalTitle}
A simple and lean react template.
To start parcel server:
~~~
cd ${projectName}
npm start
~~~
`, "utf8")

    // the git bit
    exec.execSync('git init', { stdio: [0, 1, 2] });

    fs.writeFileSync(
        "./.gitignore",
        `node_modules
dist
.cache`, "utf8");

}

main()