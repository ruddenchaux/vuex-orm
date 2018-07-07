export declare type Iteratee = (value: any, key: string, collection: any) => any;
export declare type Predicate<T> = (value: T, key: string) => boolean;
export interface Dictionary<T> {
    [key: string]: T;
}
/**
 * Check if the given array or object is empty.
 */
export declare function isEmpty(data: any[] | object): boolean;
/**
 * Iterates over own enumerable string keyed properties of an object and
 * invokes `iteratee` for each property.
 */
export declare function forOwn(object: any, iteratee: Iteratee): void;
/**
 * Create an array from the object.
 */
export declare function map(object: any, iteratee: Iteratee): any[];
/**
 * Creates an object with the same keys as object and values generated by
 * running each own enumerable string keyed property of object thru
 * iteratee. The iteratee is invoked with three arguments:
 * (value, key, object).
 */
export declare function mapValues(object: any, iteratee: Iteratee): any;
/**
 * Creates an object composed of the object properties predicate returns
 * truthy for. The predicate is invoked with two arguments: (value, key).
 */
export declare function pickBy<T>(object: Dictionary<T>, predicate: Predicate<T>): Dictionary<T>;
/**
 * Creates an array of elements, sorted in specified order by the results
 * of running each element in a collection thru each iteratee.
 */
export declare function orderBy<T>(collection: T[], keys: string[], directions: string[]): any;
/**
 * Creates an object composed of keys generated from the results of running
 * each element of collection thru iteratee.
 */
export declare function groupBy(collection: any[], iteratee: (record: any) => any): any;
export declare function replaceAll(source: string, search: string, replacement: string): string;
export declare function clone(source: string): any;
declare const _default: {
    isEmpty: typeof isEmpty;
    forOwn: typeof forOwn;
    groupBy: typeof groupBy;
    map: typeof map;
    mapValues: typeof mapValues;
    orderBy: typeof orderBy;
    pickBy: typeof pickBy;
    replaceAll: typeof replaceAll;
    clone: typeof clone;
};
export default _default;