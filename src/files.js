
import fs from 'fs'
import path from 'path'
import recursive from 'recursive-readdir'

import { ScrLog, getIgnores } from './helpers'

export function files(dir, cb) {

  // First get list of ignored files
  getIgnores( ignore_files => {
    // console.log(ignore_files)
    recursive(dir, ignore_files, (err, files) => {
      if (err) {
        cb(err)
      }
      else {
        let formatedFilesList = files.map(file => {
          return file.substr(dir.length + 1) // +1 removes seperator on start
        })
        cb(null, formatedFilesList)
      }
    })
  })

}
