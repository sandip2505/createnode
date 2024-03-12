#!/usr/bin/env node

// const { program } = require('commander');
// const createProject = require('./commands/createProject');

// program
//   .version('1.0.0')
//   .description('CLI for creating a Node.js project with a CRUD API');

// program
//   .command('create <projectName>')
//   .description('Create a new project with CRUD API')
//   .action(createProject);

// program.parse(process.argv);


const { program } = require('commander');
const createProject = require('./commands/createProject');

program
  .version('1.0.0')
  .description('CLI for creating a Node.js project with a CRUD API');

program
  .command('create <projectName>')
  .description('Create a new project with CRUD API')
  .action(async (projectName) => {
    const authername = await prompt('Enter author name: ');
    const dbname = await prompt('Enter database name: ');
    console.log(authername, dbname, projectName)
    createProject(projectName, authername, dbname);
  });

program.parse(process.argv);

async function prompt(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

