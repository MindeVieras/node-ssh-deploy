
import path from 'path'

export const ROOT_DIR          = process.cwd()
export const GIT_IGNORE        = path.resolve(ROOT_DIR, '.gitignore')

export const CONFIG_DIRNAME    = '.ssh-deploy'
export const CONFIG_FILENAME   = 'ssh-config.json'
export const CONFIG_IGNORENAME = '.sshignore'
export const COMMANDS_FILENAME = 'commands.json'
export const CONFIG_DIR        = path.resolve(ROOT_DIR, CONFIG_DIRNAME)
export const CONFIG_FILE       = path.resolve(CONFIG_DIR, CONFIG_FILENAME)
export const CONFIG_IGNORE     = path.resolve(ROOT_DIR, CONFIG_IGNORENAME)
export const COMMANDS_FILE     = path.resolve(CONFIG_DIR, COMMANDS_FILENAME)
