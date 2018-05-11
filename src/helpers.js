
import fs from 'fs'
import { exec } from 'child_process'
import { Client } from 'ssh2'
import clc from 'cli-color'
import recursive from 'recursive-readdir'

import { ROOT_DIR, CONFIG_FILE, CONFIG_IGNORE, COMMANDS_FILE } from './constants'

// Screen log Class
export class ScrLog {

  static log(msg) {
    console.log(clc.whiteBright(msg))
  }

  static success(msg) {
    console.log(clc.green(msg))
  }

  static warning(msg) {
    console.log(clc.yellow(msg))
  }

  static error(msg) {
    console.log(clc.red(msg))
  }

  static note(msg) {
    console.log(clc.blue(msg))
  }

}

/**
 * Reads config file and formats to JSON function.
 *
 * @return {Promise|Object}
 */
export function getConfig() {
  return new Promise( (resolve, reject) => {
    // Check if ignore file exists
    fs.readFile(CONFIG_FILE, (err, data) => {
      if (err)
        reject(`Please run 'ssh-deploy setup' to setup project`)
      else
        resolve(JSON.parse(data.toString()))
    })
  })
}

/**
 * Gets project files function.
 * First gets ignored files,
 * then reads project dir recursively
 *
 * @return {Promise|Array}
 */
export function getProjectFiles() {
  return new Promise( (resolve, reject) => {
    // Check if ignore file exists
    getIgnores()
      .then( ignores => {
        recursive(ROOT_DIR, ignores, (err, files) => {
          if (err)
            reject(err)

          else {
            let formatedFilesList = files.map(file => {
              return file.substr(ROOT_DIR.length + 1) // +1 removes seperator on start
            })
            resolve(formatedFilesList)
          }
        })
      })
      .catch( err => {
        reject(err)
      })
  })
}

/**
 * Gets all ignored project files function.
 * It reads ignore file
 *
 * @return {Promise|Array} Empty array if no config file
 */
export function getIgnores() {
  return new Promise( resolve => {
    // Check if ignore file exists
    fs.readFile(CONFIG_IGNORE, (err, data) => {
      let list = []
      if (!err)
        list = data.toString().split('\n').filter( item => item != '' )

      // Always return array even if ignore not exists
      resolve(list)
    })
  })
}

/**
 * Run exec command localy.
 * Pass a string of command
 *
 * @param  {String} `command`
 * @return {Promise}
 */
export function execLocal(command) {
  return new Promise( (resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }

      resolve({stdout, stderr})
    })
  })
}

/**
 * Run exec command on remote server function.
 * Pass server config object and a string of command
 *
 * @param  {Object} `config`
 * @param  {String} `command`
 * @return {Promise}
 */
export function execRemote(config, command) {
  return new Promise( (resolve, reject) => {

    const conn = new Client()
    conn.on('ready', () => {
      // Run exec command
      conn.exec(command, (err, stream) => {
        if (err) throw err
        stream.on('close', (code, signal) => { // On ssh connnection close
          resolve(`Extract complete`)
          conn.end()
        }).on('data', data => { // Success ssh command response
          resolve(data.toString())
        }).stderr.on('data', data => { // Handle server error
          return reject(`Error executing command on server: \n${data}`)
        })
      })
    }).on('error', err => { // Handle ssh connection error
      return reject(`Cannot connect to ${config.host} server, check ssh config`)
    }).connect({
      host: config.host,
      port: 22,
      username: config.user,
      privateKey: fs.readFileSync(config.key_pair)
    })
  })

}

export function getCommands(when, cb) {
  console.log(when)
  // Check if commands file exists
  // fs.readFile(COMMANDS_FILE, (error, data) => {
  //   let list = []
  //   if (error) {
  //     cb(list)
  //   }
  //   else {
  //     // Split each new line and filter out empty ones
  //     list = data.toString().split('\n').filter( item => item != '' )
  //     cb(list)
  //   }
  // })
}
