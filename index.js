#!/usr/bin/env node

import inquirer from 'inquirer';
import { program } from 'commander';
import createProjectMongo from './commands/createProjectMongo.js';
import createProjectSql from './commands/createProjectSql.js';

import createProjectMongoTypescript from './commands/createProjectMongoTypescript.js';
import createProjectSqlTypescript from './commands/createProjectSqlTypescript.js';
import ora from 'ora';
import chalk from 'chalk';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';


function winner() {
  console.clear();
  figlet(`PROJECT  CREATED  SUCCESSFULLY`, (err, data) => {
    console.log(gradient.pastel.multiline(data) + '\n');

    console.log(
      chalk.green(
        `Your project has been created successfully. Now, let's make some magic happen!`
      )
    );
    process.exit(0);
  });
}


program
  .version('1.0.0')
  .description('CLI for creating a Node.js project with a CRUD API');

program
  .command('create <projectName>')
  .description('Create a new project with CRUD API')
  .action(async (projectName) => {
    const authername = await prompt('Enter author name: ');
    const selectedDatabase = await selectDatabase();
    const selectedLanguage = await selectLanguage();

    let createProjectFunction;

    if (selectedLanguage === 'TypeScript') {
      createProjectFunction = selectedDatabase === 'MongoDB' ? createProjectMongoTypescript : createProjectSqlTypescript;
    } else {
      createProjectFunction = selectedDatabase === 'MongoDB' ? createProjectMongo : createProjectSql;
    }

    const spinner = ora('Creating project').start();
    let progress = 0;

    try {
      // Simulate progress and wait for the project creation function to complete

      const progressInterval = setInterval(() => {
        progress += 10;
        spinner.text = `Creating project (${progress}%)`;
        if (progress >= 100) {
          clearInterval(progressInterval);
          winner();
        }
      }, 500);

      await createProjectFunction(projectName, authername);

    } catch (error) {
      spinner.fail('Project creation failed');
      console.error(error);
    }
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


async function selectLanguage() {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedLanguage',
      message: 'Select a language:',
      choices: ['JavaScript',],
    },
  ]);
  return answer.selectedLanguage;
}



