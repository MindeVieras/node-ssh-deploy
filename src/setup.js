
import fs from 'fs'

import { CONFIG_FILE, CONFIG_DIR } from './constants'

export function setup(data, cb) {

  const { environment, host, user, key_pair, dest_path, port } = data
  
  // Make config dir if not exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR)
  }

  // Create new data for config file
  let newData = {
    [environment]: {
      host,
      user,
      key_pair,
      dest_path,
      port
    }
  }

  // Format new data to pretty string
  const content = JSON.stringify(newData, null, 2)

  // Write config file
  fs.writeFile(CONFIG_FILE, content, 'utf8', function (error) {
    if (error) {
      cb('Could not create config file')
    }
    else {
      cb(null, 'Setup success!')
    }
  })
  

}
