
import fs from 'fs'
import clc from 'cli-color'

import { CONFIG_IGNORE } from './constants'

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

export function getIgnores(cb) {
  // Check if ignore file exists
  fs.readFile(CONFIG_IGNORE, (error, data) => {
    let list = []
    if (error) {
      cb(list)
    }
    else {
      // Split each new line and filter out empty ones
      list = data.toString().split('\n').filter( item => item != '' )
      cb(list)
    }
  })
}
