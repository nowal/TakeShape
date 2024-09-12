import path from 'path';

export const resolvePwd = () => {
  const pwd = process.env.PWD || '';
  if (!pwd) {
    throw Error('pwd not available');
  } else {
    return pwd;
  }
};

export const prependPwd = (dir: string) =>
  path.join(resolvePwd(), dir);
