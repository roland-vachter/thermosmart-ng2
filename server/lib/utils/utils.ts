import moment from 'moment-timezone';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNumber = (n: any) => {
  return typeof n === 'number' && !isNaN(n);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPrimitive =(obj: any) => {
  return ['undefined', 'number', 'string', 'boolean', 'bigint', 'symbol'].includes(typeof obj) || obj === null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObject = (item: any) => {
  return (!!item && typeof item === 'object' && !Array.isArray(item) && item.constructor.name === 'Object');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepEqual = (obj1: any, obj2: any) => {
  if (obj1 === obj2) {
    return true;
  } else if (typeof obj1 !== typeof obj2) {
    return false;
  } else if (isPrimitive(obj1) || isPrimitive(obj2)) {
    return false;
  } else if (obj1 && obj2 && moment.isMoment(obj1) && moment.isMoment(obj2)) {
    return obj1.isSame(obj2);
  } else if (obj1 && obj2 && obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  } else if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  } else if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2)) {
      return false;
    } else {
      for (const cell of obj1) {
        if (!obj2.find(c2 => deepEqual(cell, c2))) {
          return false;
        }
      }
    }
  } else {
    for (const key in obj1) {
      if (!(key in obj2) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
  }
  return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isEmpty = (obj: any): boolean => {
  return obj === null || typeof obj === 'undefined' || (
    !isNumber(obj) && (!isPrimitive(obj) || !obj) && (!Array.isArray(obj) || !obj.length) && (!isObject(obj) || !Object.keys(obj).length)
  );
}

export const unique = <T>(array: T[], mapper?: (o: T) => unknown): T[] => {
  return array.filter((e, i, a) => e && (mapper ? a.map(mapper) : a).indexOf(mapper ? mapper(e) : e) === i);
}

export const uniqueDeep = <T>(array: T[], mapper?: (o: T) => unknown): T[] => {
  return array.filter((e, i, a) => e && (mapper ? a.map(mapper) : a).findIndex(ae => deepEqual(ae, (mapper ? mapper(e) : e))) === i);
}

export const groupBy = <T extends Record<string, string>>(array: T[], prop: string): Record<string, T[]> => {
  return array.reduce((acc, v) => {
    if (!acc[v[prop]]) {
      acc[v[prop]] = [];
    }

    acc[v[prop]].push(v);

    return acc;
  }, {} as Record<string, T[]>);
}

export const deepClone = <T>(item: T): T => {
  if (!item) {
    return item;
  } // null, undefined values check

  const primitiveTypes = [ Number, String, Boolean ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;

  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  primitiveTypes.forEach((primitiveType) => {
    if (item instanceof primitiveType) {
      result = primitiveType( item );
    }
  });

  if (typeof result === 'undefined') {
    if (Array.isArray(item)) {
      result = [];
      item.forEach((child, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        result[index] = deepClone(child);
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    } else if (isObject(item)) {
      // testing that this is DOM
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((item as any).nodeType && typeof (item as any).cloneNode == 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return (item as any).cloneNode( true );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if (!(item as any).prototype) { // check that this is a literal
        if (item instanceof Date) {
          result = new Date(item);
        } else if (moment.isMoment(item)) {
          result = moment(item).clone();
        } else {
          // it is an object literal
          result = {};
          for (const i in item) {
            if (item.hasOwnProperty(i)) {
              result[i] = deepClone(item[i]);
            }
          }
        }
      } else {
        result = item;
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result = Object.assign(Object.create(Object.getPrototypeOf(item)), item);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepMerge = (target: any, ...sources: any[]): any => {
	if (!sources.length) {
		return target;
	}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
					Object.assign(target, { [key]: {} });
				}

        deepMerge(target[key], source[key]);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
