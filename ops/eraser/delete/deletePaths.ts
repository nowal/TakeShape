import fs, { PathLike } from 'fs';
import { unlink } from  "fs/promises";

export const deletePaths = (paths: PathLike[]) => {
  paths.forEach((path: PathLike) => {
    if (fs.existsSync(path)) {
      if (fs.lstatSync(path).isDirectory()) {
        fs.rmSync(path, { recursive: true, force: true });
      } else {
        unlink(path);
      }
      console.log(path, 'DELETED');
    } else {
      console.log('NOT FOUND');
    }
  });
};
