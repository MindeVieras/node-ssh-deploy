
import path from 'path'
import fs from 'fs'
import tar from 'tar'
import Ora from 'ora'
import clc from 'cli-color'

import { ScrLog, getConfig, getProjectFiles, execLocal, execRemote } from './helpers'
import { CONFIG_DIR } from './constants'

export function deploy(env, cb) {

  // Create spinner instance
  const spinner = new Ora({
    spinner: {
      interval: 80,
      frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    },
    color: 'cyan'
  })


  /**
   * Run deploy in 4 steps.
   *
   * 1. Get project files.
   * 2. Compress project files.
   * 3. Upload project files to server.
   * 4. Extract project files on server.
   *
   */

  let config, archiveFilename, archiveFile

  // Start by getting project config
  getConfig()

    /**
     * Check if environment exists in config.
     *
     * @param  {Object} `conf` data from config file
     * @return {Function|Array} `files` from getProjectFiles()
     */
    .then( conf => {
      // Check if environment exists in config
      if(conf.hasOwnProperty(env)) {

        config = conf[env] // Set global config data

        // Get list of project files
        return getProjectFiles()
      }
      // If environment not found throw error
      else
        throw `Environment '${env}' not found`
    })


    /**
     * Compress project files.
     *
     * @param  {Array} `files` from getProjectFiles()
     * @return {Function} tar()
     */
    .then( files => {
      // Make archive
      spinner.start(`Compressing project files`) // Start archive spinner

      // Set new globals
      archiveFilename = env + '.tgz'
      archiveFile = path.resolve(CONFIG_DIR, archiveFilename)

      const tarConfig = {
        gzip: true,
        file: archiveFile
      }
      return tar.c(tarConfig, files)
    })


    /**
     * Upload project files to server.
     *
     * @return {Function} execLocal()
     */
    .then( () => {
      // Stop archive spinner
      spinner.succeed(`Compressing project files  | ${clc.green(`Success`)}`)

      // upload archive to server with scp
      spinner.start(`Copying archive to server`) // Start scp spinner
      return execLocal(`scp -i ${config.key_pair} ${archiveFile} ${config.user}@${config.host}:${config.dest_path}`)
    })


    /**
     * Extract project files on server.
     *
     * @return {Function} execRemote()
     */
    .then( () => {
      // Stop scp spinner
      spinner.succeed(`Copying archive to server  | ${clc.green(`Success`)}`)

      // unarchive project on server
      spinner.start(`Extracting files on server`) // Start extract files spinner
      const archiveOnServer = path.join(config.dest_path, archiveFilename)
      const unarchiveCommand = `tar -xzf ${archiveOnServer} --directory ${config.dest_path} --warning=no-timestamp`
      return execRemote(config, unarchiveCommand)
    })
    .then( () => {
      // Stop extract files spinner
      spinner.succeed(`Extracting files on server | ${clc.green(`Success`)}`)

      cb(null, 'Deploy complete')
    })

    /**
     * Catch errors.
     * Stop spinner with fail()
     *
     * @param  {String} `err`
     */
    .catch( err => {
      spinner.stop()
      cb(err)
    })
}
