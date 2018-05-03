
import fs from 'fs'

import { CONFIG_FILENAME } from './constants'

export function setup(data, cb) {

  const { environment, host, user, pass, port } = data

  let newData = {
    [environment]: {
      host,
      user,
      pass,
      port
    }
  }

  // Format JSON data to pretty string
  const content = JSON.stringify(newData, null, 2)

  // Write config file
  fs.writeFile(CONFIG_FILENAME, content, 'utf8', function (error) {
    if (error) {
      cb('Could not create config file')
    }
    else {
      cb(null, 'Setup success!')
    }
  })
}
