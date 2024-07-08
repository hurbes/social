type FlattenOptions = {
  delimiter?: string;
  maxDepth?: number;
  transformKey?: (key: string) => string;
  safe?: boolean;
  object?: boolean;
  overwrite?: boolean;
};

function isBuffer(obj: any): boolean {
  return (
    obj &&
    obj.constructor &&
    typeof obj.constructor.isBuffer === 'function' &&
    obj.constructor.isBuffer(obj)
  );
}

function keyIdentity(key: string): string {
  return key;
}

export function flatten(
  target: Record<string, any>,
  opts: FlattenOptions = {},
): Record<string, any> {
  const delimiter = opts.delimiter || '.';
  const maxDepth = opts.maxDepth;
  const transformKey = opts.transformKey || keyIdentity;
  const output: Record<string, any> = {};

  function step(
    object: Record<string, any>,
    prev?: string,
    currentDepth: number = 1,
  ): void {
    Object.keys(object).forEach((key) => {
      const value = object[key];
      const isArray = opts.safe && Array.isArray(value);
      const type = Object.prototype.toString.call(value);
      const isBufferValue = isBuffer(value);
      const isObject = type === '[object Object]' || type === '[object Array]';

      const newKey = prev
        ? `${prev}${delimiter}${transformKey(key)}`
        : transformKey(key);

      if (
        !isArray &&
        !isBufferValue &&
        isObject &&
        Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)
      ) {
        step(value, newKey, currentDepth + 1);
      } else {
        output[newKey] = value;
      }
    });
  }

  step(target);

  return output;
}

export function unflatten(
  target: Record<string, any>,
  opts: FlattenOptions = {},
): any {
  const delimiter = opts.delimiter || '.';
  const overwrite = opts.overwrite || false;
  const transformKey = opts.transformKey || keyIdentity;
  const result: Record<string, any> = {};

  const isBufferValue = isBuffer(target);
  if (
    isBufferValue ||
    Object.prototype.toString.call(target) !== '[object Object]'
  ) {
    return target;
  }

  function getkey(key: string): string | number {
    const parsedKey = Number(key);
    return isNaN(parsedKey) || key.indexOf('.') !== -1 || opts.object
      ? key
      : parsedKey;
  }

  function addKeys(
    keyPrefix: string,
    recipient: Record<string, any>,
    target: Record<string, any>,
  ): Record<string, any> {
    return Object.keys(target).reduce((result, key) => {
      result[`${keyPrefix}${delimiter}${key}`] = target[key];
      return result;
    }, recipient);
  }

  function isEmpty(val: any): boolean {
    const type = Object.prototype.toString.call(val);
    const isArray = type === '[object Array]';
    const isObject = type === '[object Object]';

    if (!val) {
      return true;
    } else if (isArray) {
      return !val.length;
    } else if (isObject) {
      return !Object.keys(val).length;
    }

    return false;
  }

  target = Object.keys(target).reduce((result, key) => {
    const type = Object.prototype.toString.call(target[key]);
    const isObject = type === '[object Object]' || type === '[object Array]';
    if (!isObject || isEmpty(target[key])) {
      result[key] = target[key];
      return result;
    } else {
      return addKeys(key, result, flatten(target[key], opts));
    }
  }, {});

  Object.keys(target).forEach((key) => {
    const split = key.split(delimiter).map(transformKey);
    let key1 = getkey(split.shift()!);
    let key2 = getkey(split[0]);
    let recipient = result;

    while (key2 !== undefined) {
      if (key1 === '__proto__') {
        return;
      }

      const type = Object.prototype.toString.call(recipient[key1]);
      const isObject = type === '[object Object]' || type === '[object Array]';

      if (!overwrite && !isObject && typeof recipient[key1] !== 'undefined') {
        return;
      }

      if ((overwrite && !isObject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = typeof key2 === 'number' && !opts.object ? [] : {};
      }

      recipient = recipient[key1];
      if (split.length > 0) {
        key1 = getkey(split.shift()!);
        key2 = getkey(split[0]);
      }
    }

    recipient[key1] = unflatten(target[key], opts);
  });

  return result;
}
