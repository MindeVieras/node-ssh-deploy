
import fs from 'fs'

import { CONFIG_FILENAME } from './constants'

export function deploy(env, cb) {

  // Check if config file exists
  fs.readFile(CONFIG_FILENAME, (error, data) => {
    
    // If no config file, log message
    if (error) {
      cb('Please run \'ssh-deploy s\' to create config file')
    }

    // If config file is found
    else {
      
      const configFile = data.toString()
      const jsonData = JSON.parse(configFile)

      // Check if environment exists in config file
      if(jsonData.hasOwnProperty(env)) {

        cb(null, 'Deploying...')

      }

      // If environment not found in confog file, log message
      else {
        cb('Environment not found')
      }
    }
  })
}
