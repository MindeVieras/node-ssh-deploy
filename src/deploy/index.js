
import path from 'path'
import fs from 'fs'
import tar from 'tar'
import { Spinner } from 'cli-spinner'
import { exec } from 'child_process'
import { Client } from 'ssh2'

import { CONFIG_FILE, CONFIG_DIR } from '../constants'

export function deploy(env, cb) {

  // Check if config file exists
  fs.readFile(CONFIG_FILE, (error, data) => {
    
    // If no config file, log message
    if (error) {
      cb('Please run \'ssh-deploy setup\' to setup project')
    }

    // If config file is found
    else {
      
      // Parse json from file
      const jsonData = JSON.parse(data.toString())

      // Check if environment exists in config file
      if(jsonData.hasOwnProperty(env)) {

        // Run deploy script
        const archiveFilename = env + '.tgz'
        const archiveFile = path.resolve(CONFIG_DIR, archiveFilename)
        
        // Make archive
        const tarSpinner = new Spinner('archiving project files... %s ')
        tarSpinner.setSpinnerString('|/-\\')
        tarSpinner.start()

        tar.c(
          
          {
            gzip: true,
            file: archiveFile
          },
          ['dist', 'package.json']
        
        ).then(() => {
          tarSpinner.stop(true)

          const { host, user, key_pair, dest_path } = jsonData[env]
          
          // upload archive to server with scp
          const scpSpinner = new Spinner('copying archive to server... %s ')
          scpSpinner.setSpinnerString('|/-\\')
          scpSpinner.start()
          const scpCommand = 'scp -i '+key_pair+' '+archiveFile+' '+user+'@'+host+':'+dest_path
          exec(scpCommand, (error, stdout, stderr) => {
            scpSpinner.stop(true)
            
            if (error) {
              cb('Local error: '+error)
            }
            if (stderr) {
              cb('Server error: '+stderr)
            }
            else {
              // unarchive project on server
              // Connsect to server
              var conn = new Client()
              conn.on('ready', () => {
                
                const archiveOnServer = dest_path+'/'+archiveFilename
                const unarchiveCommand = 'tar -xzf '+archiveOnServer+' --directory '+dest_path
                
                const untarSpinner = new Spinner('unarchiving project files on server... %s ')
                untarSpinner.setSpinnerString('|/-\\')
                untarSpinner.start()

                conn.exec(unarchiveCommand, (err, stream) => {
                  untarSpinner.stop(true)
                  if (err) throw err
                  stream.on('close', (code, signal) => { // On ssh connnection close
                    cb(null, 'Deploy complete')
                    conn.end()
                  }).on('data', data => { // Success ssh command response
                    console.log('STDOUT: ' + data)
                  }).stderr.on('data', data => { // Handle server error
                    cb('Server error: ' + data)
                  })
                })
              }).on('error', err => { // Handle ssh connection error
                cb('Cannot connect to '+host+' server, check ssh config')
              }).connect({
                host,
                port: 22,
                username: user,
                privateKey: fs.readFileSync(key_pair)
              })
            }
          })
        })

      }

      // If environment not found in confog file, log message
      else {
        cb('Environment \''+ env +'\' not found')
      }
    }
  })
}
