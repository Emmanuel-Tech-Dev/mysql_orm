const utils = {
  convertArrayToObject(arr) {
    if (!arr || !arr.record) {
      // Return the input object as is, or handle the error
      return arr;
    }

    // 2. Get an array of all values inside the arr.record
    // Since we expect only one record, this array will contain one element: [{...}]
    const recordValues = Object.values(arr.record);

    // 3. Check if there is at least one record
    if (recordValues.length === 0) {
      // If the inner object is empty, set 'record' to null or an empty object
      return { record: null };
    }

    // 4. Return the new object with the first record value promoted
    return {
      ...arr, // Spread any other top-level keys if they exist
      record: recordValues[0], // The first element is the record object we want
    };
  },
  removePasswordFromObject(obj) {
    const clone = structuredClone(obj); // deep clone for safety

    // If the object itself has a password
    if (clone?.password) {
      delete clone.password;
    }

    // Check for results/items/data keys
    const collections = ["results", "items", "data"];

    for (const key of collections) {
      if (Array.isArray(clone[key])) {
        clone[key] = clone[key].map((item) => {
          if (item && typeof item === "object") {
            const newItem = { ...item };
            delete newItem.password;
            return newItem;
          }
          return item;
        });
      }
    }

    return clone;
  },
};
module.exports = utils;
