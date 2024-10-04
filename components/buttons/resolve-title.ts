
export const resolveTitle = ({children,title:_title}: Partial<{title:string,children:any}>) => {
  let title = undefined;
  if (typeof children === 'string') {
    title = children;
  }
  if (typeof _title === 'string') {
    title = _title;
  }

  return title;
}