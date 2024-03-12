export function jsx(...params) {
  console.log(params);
  const [tag, parameters] = params;
  const e = document.createElement(tag);
  const {children, ...properties} = parameters;
  properties.class?.split(' ').forEach(e.classList.add.bind(e.classList));  
  delete properties.class;
  for (const property in properties)
    e[property] = properties[property];
  if (children != undefined)
    e.replaceChildren(...children);
  return e;
}

export const jsxs = jsx;
