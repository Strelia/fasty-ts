import os from 'os';
import util from 'util';
import childProcess from 'child_process';
const exec = util.promisify(childProcess.exec);

export async function unzip(file:string, destination: string) {
  const expandCommand = os.platform() === 'win32' ?
        `powershell -command "& {&'Expand-Archive' ${file} -DestinationPath ${destination}}"` :
        `unzip ${file} -d ${destination}`;

  const { stdout, stderr } = await exec(expandCommand);
  return stderr ? Promise.reject(stderr) : stdout;
}
