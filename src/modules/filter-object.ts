export default function filterObjectByKeys(obj: { [key: string]: any }, keysArray: string[]) {
  const filteredObject: { [key: string]: any } = {};

  keysArray.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      filteredObject[key] = obj[key];
    }
  });

  return filteredObject;
}