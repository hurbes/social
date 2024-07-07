// Utility function to flatten nested objects
function flattenObject(obj: any, parent: string = '', res: any = {}): any {
  for (const key in obj) {
    const propName = parent ? parent + '_' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}

// Utility function to unflatten nested objects
function unflattenObject(data: any): any {
  const result: any = {};
  for (const key in data) {
    const keys = key.split('_');
    keys.reduce((r: any, e: any, j: any) => {
      return (
        r[e] ||
        (r[e] = isNaN(Number(keys[j + 1]))
          ? keys.length - 1 === j
            ? data[key]
            : {}
          : [])
      );
    }, result);
  }
  return result;
}

// function parseRecordToSchema<T extends ZodTypeAny>(
//   schema: T,
//   record: Record<string, string>,
// ): z.infer<T> {
//   if (schema instanceof ZodObject) {
//     const transformedData: Record<string, any> = {};
//     for (const key in schema.shape) {
//       const zodType = schema.shape[key];

//       if (zodType instanceof ZodOptional && !record.hasOwnProperty(key)) {
//         transformedData[key] = undefined; // Explicitly set to undefined for optional fields
//       } else {
//         transformedData[key] = parseRecordToSchema(zodType, record);
//       }
//     }
//     return schema.parse(transformedData);
//   } else if (schema instanceof ZodUnion || schema instanceof ZodIntersection) {
//     for (const subSchema of schema._def.options) {
//       try {
//         return parseRecordToSchema(subSchema, record);
//       } catch (err) {
//         // Move on to the next schema option if parsing fails
//       }
//     }
//     throw new Error(
//       `Invalid data: does not match any union/intersection options for ${schema._def.typeName}`,
//     );
//   } else if (schema instanceof ZodEffects) {
//     return parseRecordToSchema(schema._def.schema, record); // Unwrap ZodEffects
//   } else if (schema instanceof ZodOptional) {
//     const innerType = schema._def.innerType;
//     if (record.hasOwnProperty(innerType._def.typeName)) {
//       return parseRecordToSchema(innerType, record) as z.infer<T>; // Parse inner type if present
//     } else {
//       return undefined as z.infer<T>; // Return undefined if not present
//     }
//   } else if (
//     schema instanceof ZodString ||
//     schema instanceof ZodNumber ||
//     schema instanceof ZodBoolean ||
//     schema instanceof ZodDate
//   ) {
//     return schema.parse(record[schema._def.typeName]); // Parse directly for primitive types
//   } else if (schema instanceof ZodDefault) {
//     // Handle ZodDefault
//     try {
//       const parsedValue = parseRecordToSchema(schema._def.innerType, record);
//       return parsedValue !== undefined
//         ? parsedValue
//         : schema._def.defaultValue();
//     } catch (error) {
//       return schema._def.defaultValue(); // Return default if parsing fails
//     }
//   } else if (schema._def.typeName === 'ZodObjectId') {
//     return new Types.ObjectId(record[schema._def.typeName]) as z.infer<T>; // Handle MongoDB ObjectId
//   } else {
//     throw new Error(`Unsupported Zod type: ${schema._def.typeName}`);
//   }
// }

export { flattenObject, unflattenObject };
