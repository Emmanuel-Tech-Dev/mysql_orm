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
  removePasswordFromObject(data) {
    const clone = structuredClone(data); // deep clone for safety

    // Helper function to recursively remove password from an object
    const removePassword = (obj) => {
      if (obj && typeof obj === "object") {
        if (obj.password) {
          delete obj.password;
        }
        // Recursively check all properties
        Object.keys(obj).forEach((key) => {
          if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map((item) => removePassword(item));
          } else if (obj[key] && typeof obj[key] === "object") {
            removePassword(obj[key]);
          }
        });
      }
      return obj;
    };

    // Handle direct array input
    if (Array.isArray(clone)) {
      return clone.map((item) => removePassword(item));
    }

    // Handle object input
    return removePassword(clone);
  },
};
module.exports = utils;
