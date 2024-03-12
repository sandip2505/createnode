const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const createProject = async (projectName) => {
  const projectPath = path.join(process.cwd(), projectName);

  // Create the project directory
  fs.mkdirSync(projectPath);

  // Change to the project directory
  process.chdir(projectPath);

  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    main: 'index.js',
    scripts: {
      start: 'node index.js',
    },
    dependencies: {
      express: '^4.17.1',
      mongoose: '^6.2.1',
    },
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // Create index.js
  const indexJs = `
    const express = require('express');
    const mongoose = require('mongoose');
    const app = express();
    const PORT = process.env.PORT || 3000;

    mongoose.connect('mongodb://localhost/${projectName}', { useNewUrlParser: true, useUnifiedTopology: true });

    app.get('/', (req, res) => {
      res.send('Hello, CRUD API!');
    });

    app.listen(PORT, () => {
      console.log(\`Server is running on http://localhost:\${PORT}\`);
    });
  `;

  fs.writeFileSync('index.js', indexJs);

  // Install dependencies
  execSync('npm install');

  console.log(`Project ${projectName} created successfully.`);
};

module.exports = createProject;
