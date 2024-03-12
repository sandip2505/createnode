#!/usr/bin/env node

const { program } = require('commander');
const createProject = require('./commands/createProject');

program
  .version('1.0.0')
  .description('CLI for creating a Node.js project with a CRUD API');

program
  .command('create <projectName>')
  .description('Create a new project with CRUD API')
  .action(createProject);

program.parse(process.argv);
