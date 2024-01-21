export default function filterObjectByKeys(obj: { [key: string]: any }, keysArray: string[]) {
  const filteredObject: { [key: string]: any } = {};  
  keysArray.forEach(needKey => {
    if (needKey in obj) {
      filteredObject[needKey] = obj[needKey];
    }
  });
  return filteredObject;
}