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

import inquirer from 'inquirer';
import { program } from 'commander';
import createProjectMongo from './commands/createProjectMongo.js';
import createProjectSql from './commands/createProjectSql.js';


program
  .version('1.0.0')
  .description('CLI for creating a Node.js project with a CRUD API');

program
  .command('create <projectName>')
  .description('Create a new project with CRUD API')
  .action(async (projectName) => {
    const authername = await prompt('Enter author name: ');
    const selectedDatabase = await selectDatabase();
    // Dynamically import the appropriate createProject function
    const createProjectFunction = selectedDatabase === 'MongoDB' ? createProjectMongo : createProjectSql;

    createProjectFunction(projectName, authername);
  });

program.parse(process.argv);

async function prompt(question) {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'answer',
      message: question,
    },
  ]);
  return answer.answer;
}

async function selectDatabase() {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedDatabase',
      message: 'Select a database:',
      choices: ['MongoDB', 'MySQL'],
    },
  ]);
  return answer.selectedDatabase;
}


