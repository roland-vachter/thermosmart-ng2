// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNumber = (n) => {
	return typeof n === 'number' && !isNaN(n);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPrimitive = (obj) => {
	return ['undefined', 'number', 'string'].includes(typeof obj) || obj === null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (item) => {
	return (item && typeof item === 'object' && !Array.isArray(item) && item.constructor.name === 'Object');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepEqual = (obj1, obj2) => {
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
const isEmpty = (obj) => {
	return obj === null || typeof obj === 'undefined' || (
		!isNumber(obj) && (!isPrimitive(obj) || !obj) && (!Array.isArray(obj) || !obj.length) && (!isObject(obj) || !Object.keys(obj).length)
	);
}

const unique = (array, mapper) => {
	return array.filter((e, i, a) => e && (mapper ? a.map(mapper) : a).indexOf(mapper ? mapper(e) : e) === i);
}

const uniqueDeep = (array, mapper) => {
	return array.filter((e, i, a) => e && (mapper ? a.map(mapper) : a).findIndex(ae => deepEqual(ae, (mapper ? mapper(e) : e))) === i);
}

const groupBy = (array, prop) => {
	return array.reduce((acc, v) => {
		if (!acc[v[prop]]) {
			acc[v[prop]] = [];
		}

		acc[v[prop]].push(v);

		return acc;
	}, {});
}

const deepClone = (item) => {
	if (!item) {
		return item;
	} // null, undefined values check

	const primitiveTypes = [ Number, String, Boolean ];
	let result;

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
				result[index] = deepClone(child);
			});
			return result;
		} else if (isObject(item)) {
			// testing that this is DOM
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if (item.nodeType && typeof item.cloneNode == 'function') {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return item.cloneNode( true );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} else if (!item.prototype) { // check that this is a literal
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
			result = Object.assign(Object.create(Object.getPrototypeOf(item)), item);
		}
	}

	return result;
}


const deepMerge = (target, ...sources) => {
	if (!sources.length) {
		return target;
	}

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
					Object.assign(target, { [key]: {} });
				}

        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

exports.isNumber = isNumber;
exports.isPrimitive = isPrimitive;
exports.isObject = isObject;
exports.deepEqual = deepEqual;
exports.isEmpty = isEmpty;
exports.unique = unique;
exports.uniqueDeep = uniqueDeep;
exports.groupBy = groupBy;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
