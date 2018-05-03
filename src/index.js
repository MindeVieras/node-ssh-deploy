#!/usr/bin/env node

import path from 'path'
import program from 'commander'
import { prompt } from 'inquirer'

import pkg from '../package.json'

import { setup } from './setup'
import { deploy } from './deploy'

const configFilePath = path.resolve(process.cwd(), 'ssh-deploy.json')

// Promt setup questions
const setupQuestions = [
  {
    type : 'input',
    name : 'environment',
    default: 'dev',
    message : 'Enter environment name ...'
  },
  {
    type : 'input',
    name : 'host',
    message : 'Enter host ...'
  },
  {
    type : 'input',
    name : 'user',
    message : 'Enter user ...'
  },
  {
    type : 'password',
    name : 'pass',
    message : 'Enter password ...'
  },
  {
    type : 'input',
    name : 'port',
    default: '22',
    message : 'Enter port number ...'
  }
]

program
  .version(pkg.version)
  .description(pkg.description)

program
  .command('setup')
  .alias('s')
  .description('Setup project for ssh-deploy')
  .action( () => {
    prompt(setupQuestions).then(answers => {
      setup(answers, (error, success) => {
        if (error)
          console.log(error)
        else
          console.log(success)
      })
    })
  })

program
  .command('deploy <env>')
  .alias('d')
  .description('Deploy project')
  .action( (env) => {
    deploy(env, (error, success) => {
      if (error)
        console.log(error)
      else
        console.log(success)
    })
  })

// Assert that a VALID command is provided 
if (!process.argv.slice(2).length || !/[sd]/.test(process.argv.slice(2))) {
  program.outputHelp()
  process.exit()
}
program.parse(process.argv)
