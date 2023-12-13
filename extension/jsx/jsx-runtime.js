export function jsx(...params) {
  console.log("jsx");
  console.log(JSON.stringify(params));
  const [tag, parameters] = params;
  const {children, ...properties} = parameters;
  const e = document.createElement(tag);
  for (const property in properties)
    e[property] = properties[property];
  e.replaceChildren(...children);
  return e;
}

export function jsxs(...params) {
  console.log("jsxs");
  console.log(JSON.stringify(params));
  const [tag, parameters] = params;
  return jsx(tag, parameters);
}
