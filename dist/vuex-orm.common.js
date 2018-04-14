'use strict';

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (search, pos) {
        return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    };
}
if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) {
            return false;
        }
        var n = args[1] || 0;
        var k;
        if (n >= 0) {
            k = n;
        }
        else {
            k = len + n;
            if (k < 0) {
                k = 0;
            }
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement || (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    };
}

var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Connection = /** @class */ (function () {
    /**
     * Creates a connection instance.
     */
    function Connection(database) {
        this.database = database;
    }
    /**
     * Get Vuex Store instance from the database.
     */
    Connection.prototype.store = function () {
        if (this.database.store === undefined) {
            throw new Error('Store instance is not registered to the database.');
        }
        return this.database.store;
    };
    /**
     * Get models from the database.
     */
    Connection.prototype.models = function () {
        return this.database.entities.reduce(function (models, entity) {
            return __assign({}, models, (_a = {}, _a[entity.model.entity] = entity.model, _a));
            var _a;
        }, {});
    };
    /**
     * Find model in database by given name.
     */
    Connection.prototype.model = function (name) {
        return this.models()[name];
    };
    /**
     * Get modules from the database.
     */
    Connection.prototype.modules = function () {
        return this.database.entities.reduce(function (modules, entity) {
            return __assign({}, modules, (_a = {}, _a[entity.model.entity] = entity.module, _a));
            var _a;
        }, {});
    };
    /**
     * Find module in database by given name.
     */
    Connection.prototype.module = function (name) {
        return this.modules()[name];
    };
    return Connection;
}());

var Container = /** @class */ (function () {
    function Container() {
    }
    /**
     * Create a connection instance and registers it to the connections list.
     */
    Container.register = function (name, database) {
        this.connections[name] = new Connection(database);
    };
    /**
     * Find connection with the given from the connection list.
     */
    Container.connection = function (name) {
        return this.connections[name];
    };
    /**
     * A list of connections that have been registered to the Vuex Store.
     */
    Container.connections = {};
    return Container;
}());

var ModuleOptions = /** @class */ (function () {
    function ModuleOptions() {
    }
    ModuleOptions.register = function (options) {
        if (options.namespace) {
            this.namespace = options.namespace;
        }
        if (options.resources) {
            this.resources = options.resources;
        }
    };
    ModuleOptions.namespace = 'entities';
    ModuleOptions.resources = {
        baseUrl: ''
    };
    return ModuleOptions;
}());

var install = (function (database, options) {
    return function (store) {
        ModuleOptions.register(options);
        store.registerModule(ModuleOptions.namespace, database.createModule(ModuleOptions.namespace));
        database.registerStore(store);
        database.registerNamespace(ModuleOptions.namespace);
        Container.register(ModuleOptions.namespace, database);
    };
});

/**
 * Check if the given array or object is empty.
 */
function isEmpty(data) {
    if (Array.isArray(data)) {
        return data.length === 0;
    }
    return Object.keys(data).length === 0;
}
/**
 * Iterates over own enumerable string keyed properties of an object and
 * invokes `iteratee` for each property.
 */
function forOwn(object, iteratee) {
    Object.keys(object).forEach(function (key) { return iteratee(object[key], key, object); });
}
/**
 * Create an array from the object.
 */
function map(object, iteratee) {
    return Object.keys(object).map(function (key) {
        return iteratee(object[key], key, object);
    });
}
/**
 * Creates an object with the same keys as object and values generated by
 * running each own enumerable string keyed property of object thru
 * iteratee. The iteratee is invoked with three arguments:
 * (value, key, object).
 */
function mapValues(object, iteratee) {
    var newObject = Object.assign({}, object);
    return Object.keys(object).reduce(function (records, key) {
        records[key] = iteratee(object[key], key, object);
        return records;
    }, newObject);
}
/**
 * Creates an object composed of the object properties predicate returns
 * truthy for. The predicate is invoked with two arguments: (value, key).
 */
function pickBy(object, predicate) {
    return Object.keys(object).reduce(function (records, key) {
        var value = object[key];
        if (predicate(value, key)) {
            records[key] = value;
        }
        return records;
    }, {});
}
/**
 * Creates an array of elements, sorted in specified order by the results
 * of running each element in a collection thru each iteratee.
 */
function orderBy(collection, keys, directions) {
    var index = -1;
    var result = collection.map(function (value) {
        var criteria = keys.map(function (key) { return value[key]; });
        return { criteria: criteria, index: ++index, value: value };
    });
    return baseSortBy(result, function (object, other) {
        return compareMultiple(object, other, directions);
    });
}
/**
 * Creates an object composed of keys generated from the results of running
 * each element of collection thru iteratee.
 */
function groupBy(collection, iteratee) {
    return collection.reduce(function (records, record) {
        var key = iteratee(record);
        if (records[key] === undefined) {
            records[key] = [];
        }
        records[key].push(record);
        return records;
    }, {});
}
/**
 * The base implementation of `_.sortBy` which uses `comparer` to define the
 * sort order of `array` and replaces criteria objects with their
 * corresponding values.
 */
function baseSortBy(array, comparer) {
    var length = array.length;
    array.sort(comparer);
    while (length--) {
        array[length] = array[length].value;
    }
    return array;
}
/**
 * Used by `orderBy` to compare multiple properties of a value to another
 * and stable sort them.
 *
 * If `orders` is unspecified, all values are sorted in ascending order.
 * Otherwise, specify an order of "desc" for descending or "asc" for
 * ascending sort order of corresponding values.
 */
function compareMultiple(object, other, orders) {
    var objCriteria = object.criteria;
    var othCriteria = other.criteria;
    var length = objCriteria.length;
    var ordersLength = orders.length;
    var index = -1;
    while (++index < length) {
        var result = compareAscending(objCriteria[index], othCriteria[index]);
        if (result) {
            if (index >= ordersLength) {
                return result;
            }
            var order = orders[index];
            return result * (order === 'desc' ? -1 : 1);
        }
    }
    return object.index - other.index;
}
/**
 * Compares values to sort them in ascending order.
 */
function compareAscending(value, other) {
    if (value !== other) {
        if (value > other) {
            return 1;
        }
        if (value < other) {
            return -1;
        }
    }
    return 0;
}
var Utils = {
    isEmpty: isEmpty,
    forOwn: forOwn,
    groupBy: groupBy,
    map: map,
    mapValues: mapValues,
    orderBy: orderBy,
    pickBy: pickBy
};

var Attribute = /** @class */ (function () {
    /**
     * Create a new attribute instance.
     */
    function Attribute(model) {
        this.model = model;
    }
    return Attribute;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Type = /** @class */ (function (_super) {
    __extends(Type, _super);
    /**
     * Create a new type instance.
     */
    function Type(model, mutator) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.mutator = mutator;
        return _this;
    }
    /**
     * Mutate the given value by mutator.
     */
    Type.prototype.mutate = function (value, key) {
        var mutator = this.mutator || this.model.mutators()[key];
        return mutator ? mutator(value) : value;
    };
    return Type;
}(Attribute));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Attr = /** @class */ (function (_super) {
    __extends$1(Attr, _super);
    /**
     * Create a new attr instance.
     */
    function Attr(model, value, mutator) {
        var _this = _super.call(this, model, mutator) /* istanbul ignore next */ || this;
        _this.value = value;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    Attr.prototype.fill = function (value) {
        return value !== undefined ? value : this.value;
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    Attr.prototype.make = function (value, _parent, key) {
        return this.mutate(this.fill(value), key);
    };
    return Attr;
}(Type));

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var String$1 = /** @class */ (function (_super) {
    __extends$2(String, _super);
    /**
     * Create a new string instance.
     */
    function String(model, value, mutator) {
        var _this = _super.call(this, model, mutator) /* istanbul ignore next */ || this;
        _this.value = value;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    String.prototype.fill = function (value) {
        if (value === undefined) {
            return this.value;
        }
        if (typeof value === 'string') {
            return value;
        }
        return value + '';
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    String.prototype.make = function (value, _parent, key) {
        return this.mutate(this.fill(value), key);
    };
    return String;
}(Type));

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Number = /** @class */ (function (_super) {
    __extends$3(Number, _super);
    /**
     * Create a new number instance.
     */
    function Number(model, value, mutator) {
        var _this = _super.call(this, model, mutator) /* istanbul ignore next */ || this;
        _this.value = value;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    Number.prototype.fill = function (value) {
        if (value === undefined) {
            return this.value;
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            return parseInt(value, 0);
        }
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        return 0;
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    Number.prototype.make = function (value, _parent, key) {
        return this.mutate(this.fill(value), key);
    };
    return Number;
}(Type));

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Boolean = /** @class */ (function (_super) {
    __extends$4(Boolean, _super);
    /**
     * Create a new number instance.
     */
    function Boolean(model, value, mutator) {
        var _this = _super.call(this, model, mutator) /* istanbul ignore next */ || this;
        _this.value = value;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    Boolean.prototype.fill = function (value) {
        if (value === undefined) {
            return this.value;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            if (value.length === 0) {
                return false;
            }
            var int = parseInt(value, 0);
            return isNaN(int) ? true : !!int;
        }
        if (typeof value === 'number') {
            return !!value;
        }
        return false;
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    Boolean.prototype.make = function (value, _parent, key) {
        return this.mutate(this.fill(value), key);
    };
    return Boolean;
}(Type));

var __extends$5 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Increment = /** @class */ (function (_super) {
    __extends$5(Increment, _super);
    function Increment() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * The initial count to start incrementing.
         */
        _this.value = 1;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    Increment.prototype.fill = function (value) {
        return typeof value === 'number' ? value : null;
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    Increment.prototype.make = function (value, _parent, _key) {
        return typeof value === 'number' ? value : null;
    };
    return Increment;
}(Type));

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var ImmutableUtils = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isImmutable = isImmutable;
exports.denormalizeImmutable = denormalizeImmutable;
/**
 * Helpers to enable Immutable compatibility *without* bringing in
 * the 'immutable' package as a dependency.
 */

/**
 * Check if an object is immutable by checking if it has a key specific
 * to the immutable library.
 *
 * @param  {any} object
 * @return {bool}
 */
function isImmutable(object) {
  return !!(object && typeof object.hasOwnProperty === 'function' && (object.hasOwnProperty('__ownerID') || // Immutable.Map
  object._map && object._map.hasOwnProperty('__ownerID') // Immutable.Record
  ));
}

/**
 * Denormalize an immutable entity.
 *
 * @param  {Schema} schema
 * @param  {Immutable.Map|Immutable.Record} input
 * @param  {function} unvisit
 * @param  {function} getDenormalizedEntity
 * @return {Immutable.Map|Immutable.Record}
 */
function denormalizeImmutable(schema, input, unvisit) {
  return Object.keys(schema).reduce(function (object, key) {
    // Immutable maps cast keys to strings on write so we need to ensure
    // we're accessing them using string keys.
    var stringKey = '' + key;

    if (object.has(stringKey)) {
      return object.set(stringKey, unvisit(object.get(stringKey), schema[stringKey]));
    } else {
      return object;
    }
  }, input);
}
});

unwrapExports(ImmutableUtils);
var ImmutableUtils_1 = ImmutableUtils.isImmutable;
var ImmutableUtils_2 = ImmutableUtils.denormalizeImmutable;

var Entity = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();



var ImmutableUtils$$1 = _interopRequireWildcard(ImmutableUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getDefaultGetId = function getDefaultGetId(idAttribute) {
  return function (input) {
    return ImmutableUtils$$1.isImmutable(input) ? input.get(idAttribute) : input[idAttribute];
  };
};

var EntitySchema = function () {
  function EntitySchema(key) {
    var definition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, EntitySchema);

    if (!key || typeof key !== 'string') {
      throw new Error('Expected a string key for Entity, but found ' + key + '.');
    }

    var _options$idAttribute = options.idAttribute,
        idAttribute = _options$idAttribute === undefined ? 'id' : _options$idAttribute,
        _options$mergeStrateg = options.mergeStrategy,
        mergeStrategy = _options$mergeStrateg === undefined ? function (entityA, entityB) {
      return _extends({}, entityA, entityB);
    } : _options$mergeStrateg,
        _options$processStrat = options.processStrategy,
        processStrategy = _options$processStrat === undefined ? function (input) {
      return _extends({}, input);
    } : _options$processStrat;


    this._key = key;
    this._getId = typeof idAttribute === 'function' ? idAttribute : getDefaultGetId(idAttribute);
    this._idAttribute = idAttribute;
    this._mergeStrategy = mergeStrategy;
    this._processStrategy = processStrategy;
    this.define(definition);
  }

  _createClass(EntitySchema, [{
    key: 'define',
    value: function define(definition) {
      this.schema = Object.keys(definition).reduce(function (entitySchema, key) {
        var schema = definition[key];
        return _extends({}, entitySchema, _defineProperty({}, key, schema));
      }, this.schema || {});
    }
  }, {
    key: 'getId',
    value: function getId(input, parent, key) {
      return this._getId(input, parent, key);
    }
  }, {
    key: 'merge',
    value: function merge(entityA, entityB) {
      return this._mergeStrategy(entityA, entityB);
    }
  }, {
    key: 'normalize',
    value: function normalize(input, parent, key, visit, addEntity) {
      var _this = this;

      var processedEntity = this._processStrategy(input, parent, key);
      Object.keys(this.schema).forEach(function (key) {
        if (processedEntity.hasOwnProperty(key) && _typeof(processedEntity[key]) === 'object') {
          var schema = _this.schema[key];
          processedEntity[key] = visit(processedEntity[key], processedEntity, key, schema, addEntity);
        }
      });

      addEntity(this, processedEntity, input, parent, key);
      return this.getId(input, parent, key);
    }
  }, {
    key: 'denormalize',
    value: function denormalize(entity, unvisit) {
      var _this2 = this;

      if (ImmutableUtils$$1.isImmutable(entity)) {
        return ImmutableUtils$$1.denormalizeImmutable(this.schema, entity, unvisit);
      }

      Object.keys(this.schema).forEach(function (key) {
        if (entity.hasOwnProperty(key)) {
          var schema = _this2.schema[key];
          entity[key] = unvisit(entity[key], schema);
        }
      });
      return entity;
    }
  }, {
    key: 'key',
    get: function get() {
      return this._key;
    }
  }, {
    key: 'idAttribute',
    get: function get() {
      return this._idAttribute;
    }
  }]);

  return EntitySchema;
}();

exports.default = EntitySchema;
});

unwrapExports(Entity);

var Polymorphic = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PolymorphicSchema = function () {
  function PolymorphicSchema(definition, schemaAttribute) {
    _classCallCheck(this, PolymorphicSchema);

    if (schemaAttribute) {
      this._schemaAttribute = typeof schemaAttribute === 'string' ? function (input) {
        return input[schemaAttribute];
      } : schemaAttribute;
    }
    this.define(definition);
  }

  _createClass(PolymorphicSchema, [{
    key: 'define',
    value: function define(definition) {
      this.schema = definition;
    }
  }, {
    key: 'getSchemaAttribute',
    value: function getSchemaAttribute(input, parent, key) {
      return !this.isSingleSchema && this._schemaAttribute(input, parent, key);
    }
  }, {
    key: 'inferSchema',
    value: function inferSchema(input, parent, key) {
      if (this.isSingleSchema) {
        return this.schema;
      }

      var attr = this.getSchemaAttribute(input, parent, key);
      return this.schema[attr];
    }
  }, {
    key: 'normalizeValue',
    value: function normalizeValue(value, parent, key, visit, addEntity) {
      var schema = this.inferSchema(value, parent, key);
      if (!schema) {
        return value;
      }
      var normalizedValue = visit(value, parent, key, schema, addEntity);
      return this.isSingleSchema || normalizedValue === undefined || normalizedValue === null ? normalizedValue : { id: normalizedValue, schema: this.getSchemaAttribute(value, parent, key) };
    }
  }, {
    key: 'denormalizeValue',
    value: function denormalizeValue(value, unvisit) {
      var schemaKey = (0, ImmutableUtils.isImmutable)(value) ? value.get('schema') : value.schema;
      if (!this.isSingleSchema && !schemaKey) {
        return value;
      }
      var id = (0, ImmutableUtils.isImmutable)(value) ? value.get('id') : value.id;
      var schema = this.isSingleSchema ? this.schema : this.schema[schemaKey];
      return unvisit(id || value, schema);
    }
  }, {
    key: 'isSingleSchema',
    get: function get() {
      return !this._schemaAttribute;
    }
  }]);

  return PolymorphicSchema;
}();

exports.default = PolymorphicSchema;
});

unwrapExports(Polymorphic);

var Union = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();



var _Polymorphic2 = _interopRequireDefault(Polymorphic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UnionSchema = function (_PolymorphicSchema) {
  _inherits(UnionSchema, _PolymorphicSchema);

  function UnionSchema(definition, schemaAttribute) {
    _classCallCheck(this, UnionSchema);

    if (!schemaAttribute) {
      throw new Error('Expected option "schemaAttribute" not found on UnionSchema.');
    }
    return _possibleConstructorReturn(this, (UnionSchema.__proto__ || Object.getPrototypeOf(UnionSchema)).call(this, definition, schemaAttribute));
  }

  _createClass(UnionSchema, [{
    key: 'normalize',
    value: function normalize(input, parent, key, visit, addEntity) {
      return this.normalizeValue(input, parent, key, visit, addEntity);
    }
  }, {
    key: 'denormalize',
    value: function denormalize(input, unvisit) {
      return this.denormalizeValue(input, unvisit);
    }
  }]);

  return UnionSchema;
}(_Polymorphic2.default);

exports.default = UnionSchema;
});

unwrapExports(Union);

var Values = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();



var _Polymorphic2 = _interopRequireDefault(Polymorphic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ValuesSchema = function (_PolymorphicSchema) {
  _inherits(ValuesSchema, _PolymorphicSchema);

  function ValuesSchema() {
    _classCallCheck(this, ValuesSchema);

    return _possibleConstructorReturn(this, (ValuesSchema.__proto__ || Object.getPrototypeOf(ValuesSchema)).apply(this, arguments));
  }

  _createClass(ValuesSchema, [{
    key: 'normalize',
    value: function normalize(input, parent, key, visit, addEntity) {
      var _this2 = this;

      return Object.keys(input).reduce(function (output, key, index) {
        var value = input[key];
        return value !== undefined && value !== null ? _extends({}, output, _defineProperty({}, key, _this2.normalizeValue(value, input, key, visit, addEntity))) : output;
      }, {});
    }
  }, {
    key: 'denormalize',
    value: function denormalize(input, unvisit) {
      var _this3 = this;

      return Object.keys(input).reduce(function (output, key) {
        var entityOrId = input[key];
        return _extends({}, output, _defineProperty({}, key, _this3.denormalizeValue(entityOrId, unvisit)));
      }, {});
    }
  }]);

  return ValuesSchema;
}(_Polymorphic2.default);

exports.default = ValuesSchema;
});

unwrapExports(Values);

var _Array = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.denormalize = exports.normalize = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();



var _Polymorphic2 = _interopRequireDefault(Polymorphic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var validateSchema = function validateSchema(definition) {
  var isArray = Array.isArray(definition);
  if (isArray && definition.length > 1) {
    throw new Error('Expected schema definition to be a single schema, but found ' + definition.length + '.');
  }

  return definition[0];
};

var getValues = function getValues(input) {
  return Array.isArray(input) ? input : Object.keys(input).map(function (key) {
    return input[key];
  });
};

var normalize = exports.normalize = function normalize(schema, input, parent, key, visit, addEntity) {
  schema = validateSchema(schema);

  var values = getValues(input);

  // Special case: Arrays pass *their* parent on to their children, since there
  // is not any special information that can be gathered from themselves directly
  return values.map(function (value, index) {
    return visit(value, parent, key, schema, addEntity);
  });
};

var denormalize = exports.denormalize = function denormalize(schema, input, unvisit) {
  schema = validateSchema(schema);
  return input && input.map ? input.map(function (entityOrId) {
    return unvisit(entityOrId, schema);
  }) : input;
};

var ArraySchema = function (_PolymorphicSchema) {
  _inherits(ArraySchema, _PolymorphicSchema);

  function ArraySchema() {
    _classCallCheck(this, ArraySchema);

    return _possibleConstructorReturn(this, (ArraySchema.__proto__ || Object.getPrototypeOf(ArraySchema)).apply(this, arguments));
  }

  _createClass(ArraySchema, [{
    key: 'normalize',
    value: function normalize(input, parent, key, visit, addEntity) {
      var _this2 = this;

      var values = getValues(input);

      return values.map(function (value, index) {
        return _this2.normalizeValue(value, parent, key, visit, addEntity);
      }).filter(function (value) {
        return value !== undefined && value !== null;
      });
    }
  }, {
    key: 'denormalize',
    value: function denormalize(input, unvisit) {
      var _this3 = this;

      return input && input.map ? input.map(function (value) {
        return _this3.denormalizeValue(value, unvisit);
      }) : input;
    }
  }]);

  return ArraySchema;
}(_Polymorphic2.default);

exports.default = ArraySchema;
});

unwrapExports(_Array);
var _Array_1 = _Array.denormalize;
var _Array_2 = _Array.normalize;

var _Object = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.denormalize = exports.normalize = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };



var ImmutableUtils$$1 = _interopRequireWildcard(ImmutableUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _normalize = function _normalize(schema, input, parent, key, visit, addEntity) {
  var object = _extends({}, input);
  Object.keys(schema).forEach(function (key) {
    var localSchema = schema[key];
    var value = visit(input[key], input, key, localSchema, addEntity);
    if (value === undefined || value === null) {
      delete object[key];
    } else {
      object[key] = value;
    }
  });
  return object;
};

exports.normalize = _normalize;
var _denormalize = function _denormalize(schema, input, unvisit) {
  if (ImmutableUtils$$1.isImmutable(input)) {
    return ImmutableUtils$$1.denormalizeImmutable(schema, input, unvisit);
  }

  var object = _extends({}, input);
  Object.keys(schema).forEach(function (key) {
    if (object[key]) {
      object[key] = unvisit(object[key], schema[key]);
    }
  });
  return object;
};

exports.denormalize = _denormalize;

var ObjectSchema = function () {
  function ObjectSchema(definition) {
    _classCallCheck(this, ObjectSchema);

    this.define(definition);
  }

  _createClass(ObjectSchema, [{
    key: 'define',
    value: function define(definition) {
      this.schema = Object.keys(definition).reduce(function (entitySchema, key) {
        var schema = definition[key];
        return _extends({}, entitySchema, _defineProperty({}, key, schema));
      }, this.schema || {});
    }
  }, {
    key: 'normalize',
    value: function normalize() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _normalize.apply(undefined, [this.schema].concat(args));
    }
  }, {
    key: 'denormalize',
    value: function denormalize() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _denormalize.apply(undefined, [this.schema].concat(args));
    }
  }]);

  return ObjectSchema;
}();

exports.default = ObjectSchema;
});

unwrapExports(_Object);
var _Object_1 = _Object.denormalize;
var _Object_2 = _Object.normalize;

var src = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.denormalize = exports.normalize = exports.schema = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };



var _Entity2 = _interopRequireDefault(Entity);



var _Union2 = _interopRequireDefault(Union);



var _Values2 = _interopRequireDefault(Values);



var ArrayUtils = _interopRequireWildcard(_Array);



var ObjectUtils = _interopRequireWildcard(_Object);



var ImmutableUtils$$1 = _interopRequireWildcard(ImmutableUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var visit = function visit(value, parent, key, schema, addEntity) {
  if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || !value) {
    return value;
  }

  if ((typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object' && (!schema.normalize || typeof schema.normalize !== 'function')) {
    var method = Array.isArray(schema) ? ArrayUtils.normalize : ObjectUtils.normalize;
    return method(schema, value, parent, key, visit, addEntity);
  }

  return schema.normalize(value, parent, key, visit, addEntity);
};

var addEntities = function addEntities(entities) {
  return function (schema, processedEntity, value, parent, key) {
    var schemaKey = schema.key;
    var id = schema.getId(value, parent, key);
    if (!(schemaKey in entities)) {
      entities[schemaKey] = {};
    }

    var existingEntity = entities[schemaKey][id];
    if (existingEntity) {
      entities[schemaKey][id] = schema.merge(existingEntity, processedEntity);
    } else {
      entities[schemaKey][id] = processedEntity;
    }
  };
};

var schema = exports.schema = {
  Array: ArrayUtils.default,
  Entity: _Entity2.default,
  Object: ObjectUtils.default,
  Union: _Union2.default,
  Values: _Values2.default
};

var normalize = exports.normalize = function normalize(input, schema) {
  if (!input || (typeof input === 'undefined' ? 'undefined' : _typeof(input)) !== 'object') {
    throw new Error('Unexpected input given to normalize. Expected type to be "object", found "' + (typeof input === 'undefined' ? 'undefined' : _typeof(input)) + '".');
  }

  var entities = {};
  var addEntity = addEntities(entities);

  var result = visit(input, input, null, schema, addEntity);
  return { entities: entities, result: result };
};

var unvisitEntity = function unvisitEntity(id, schema, unvisit, getEntity, cache) {
  var entity = getEntity(id, schema);
  if ((typeof entity === 'undefined' ? 'undefined' : _typeof(entity)) !== 'object' || entity === null) {
    return entity;
  }

  if (!cache[schema.key]) {
    cache[schema.key] = {};
  }

  if (!cache[schema.key][id]) {
    // Ensure we don't mutate it non-immutable objects
    var entityCopy = ImmutableUtils$$1.isImmutable(entity) ? entity : _extends({}, entity);

    // Need to set this first so that if it is referenced further within the
    // denormalization the reference will already exist.
    cache[schema.key][id] = entityCopy;
    cache[schema.key][id] = schema.denormalize(entityCopy, unvisit);
  }

  return cache[schema.key][id];
};

var getUnvisit = function getUnvisit(entities) {
  var cache = {};
  var getEntity = getEntities(entities);

  return function unvisit(input, schema) {
    if ((typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object' && (!schema.denormalize || typeof schema.denormalize !== 'function')) {
      var method = Array.isArray(schema) ? ArrayUtils.denormalize : ObjectUtils.denormalize;
      return method(schema, input, unvisit);
    }

    if (input === undefined || input === null) {
      return input;
    }

    if (schema instanceof _Entity2.default) {
      return unvisitEntity(input, schema, unvisit, getEntity, cache);
    }

    return schema.denormalize(input, unvisit);
  };
};

var getEntities = function getEntities(entities) {
  var isImmutable = ImmutableUtils$$1.isImmutable(entities);

  return function (entityOrId, schema) {
    var schemaKey = schema.key;

    if ((typeof entityOrId === 'undefined' ? 'undefined' : _typeof(entityOrId)) === 'object') {
      return entityOrId;
    }

    return isImmutable ? entities.getIn([schemaKey, entityOrId.toString()]) : entities[schemaKey][entityOrId];
  };
};

var denormalize = exports.denormalize = function denormalize(input, schema, entities) {
  if (typeof input !== 'undefined') {
    return getUnvisit(entities)(input, schema);
  }
};
});

unwrapExports(src);
var src_1 = src.denormalize;
var src_2 = src.normalize;
var src_3 = src.schema;

var __extends$6 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$1 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Relation = /** @class */ (function (_super) {
    __extends$6(Relation, _super);
    function Relation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Create a new map of the record by given key.
     */
    Relation.prototype.mapRecords = function (records, key) {
        return records.reduce(function (records, record) {
            return __assign$1({}, records, (_a = {}, _a[record[key]] = record, _a));
            var _a;
        }, {});
    };
    /**
     * Get the path of the related field. It returns path as a dot-separated
     * string something like `settings.accounts`.
     */
    Relation.prototype.relatedPath = function (key, fields, parent) {
        var _this = this;
        var _key = key.split('.')[0];
        var _fields = fields || this.model.fields();
        var path = '';
        Object.keys(_fields).some(function (name) {
            if (name === _key) {
                path = parent ? parent + "." + _key : _key;
                return true;
            }
            var field = _fields[name];
            if (field instanceof Attribute) {
                return false;
            }
            var parentPath = parent ? parent + "." + name : name;
            var nestedPath = _this.relatedPath(_key, field, parentPath);
            if (!nestedPath) {
                return false;
            }
            path = nestedPath;
            return true;
        });
        return path;
    };
    /**
     * Set given related records to the item.
     */
    Relation.prototype.setRelated = function (item, related, path) {
        var paths = path.split('.');
        var length = paths.length - 1;
        var schema = item;
        for (var i = 0; i < length; i++) {
            schema = schema[paths[i]];
        }
        schema[paths[length]] = related;
        return item;
    };
    /**
     * Add constraint to the query.
     */
    Relation.prototype.addConstraint = function (query, relation) {
        var relations = relation.name.split('.');
        if (relations.length !== 1) {
            relations.shift();
            if (relations.length > 1) {
                query.with(relations.join('.'));
            }
            else {
                if (relations[0] === '*') {
                    query.withAll();
                }
                else {
                    for (var _i = 0, _a = relations[0].split('|'); _i < _a.length; _i++) {
                        var relation_1 = _a[_i];
                        query.with(relation_1);
                    }
                }
            }
            return;
        }
        var result = relation.constraint && relation.constraint(query);
        if (typeof result === 'boolean') {
            query.where(function () { return result; });
        }
    };
    return Relation;
}(Attribute));

var __extends$7 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BelongsTo = /** @class */ (function (_super) {
    __extends$7(BelongsTo, _super);
    /**
     * Create a new belongs to instance.
     */
    function BelongsTo(model, parent, foreignKey, ownerKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.parent = _this.model.relation(parent);
        _this.foreignKey = foreignKey;
        _this.ownerKey = ownerKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    BelongsTo.prototype.fill = function (value) {
        if (value === undefined) {
            return null;
        }
        if (Array.isArray(value)) {
            return null;
        }
        return value;
    };
    /**
     * Make value to be set to model property. This method is used when
     * instantiating a model or creating a plain object from a model.
     */
    BelongsTo.prototype.make = function (value, _parent, _key) {
        if (value === null) {
            return null;
        }
        if (value === undefined) {
            return null;
        }
        if (Array.isArray(value)) {
            return null;
        }
        return new this.parent(value);
    };
    /**
     * Attach the relational key to the given record.
     */
    BelongsTo.prototype.attach = function (key, record, _data) {
        if (record[this.foreignKey] !== undefined) {
            return;
        }
        record[this.foreignKey] = key;
    };
    /**
     * Load the belongs to relationship for the record.
     */
    BelongsTo.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedPath = this.relatedPath(relation.name);
        var relatedQuery = new Query(query.rootState, this.parent.entity, false);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = this.mapRecords(relatedQuery.get(), this.ownerKey);
        return collection.map(function (item) {
            var related = relatedRecords[item[_this.foreignKey]];
            return _this.setRelated(item, related || null, relatedPath);
        });
    };
    return BelongsTo;
}(Relation));

var __extends$8 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var HasMany = /** @class */ (function (_super) {
    __extends$8(HasMany, _super);
    /**
     * Create a new has many instance.
     */
    function HasMany(model, related, foreignKey, localKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.related = _this.model.relation(related);
        _this.foreignKey = foreignKey;
        _this.localKey = localKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    HasMany.prototype.fill = function (value) {
        return Array.isArray(value) ? value : [];
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    HasMany.prototype.make = function (value, _parent, _key) {
        var _this = this;
        if (value === null) {
            return [];
        }
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [];
        }
        if (value.length === 0) {
            return [];
        }
        return value.filter(function (record) {
            return record && typeof record === 'object';
        }).map(function (record) {
            return new _this.related(record);
        });
    };
    /**
     * Attach the relational key to the given record.
     */
    HasMany.prototype.attach = function (key, record, data) {
        var _this = this;
        key.forEach(function (index) {
            var related = data[_this.related.entity];
            if (!related || !related[index] || related[index][_this.foreignKey] !== undefined) {
                return;
            }
            related[index][_this.foreignKey] = record.$id;
        });
    };
    /**
     * Load the has many relationship for the record.
     */
    HasMany.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedQuery = new Query(query.rootState, this.related.entity, false);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = relatedQuery.get().reduce(function (records, record) {
            var key = record[_this.foreignKey];
            if (!records[key]) {
                records[key] = [];
            }
            records[key].push(record);
            return records;
        }, {});
        var relatedPath = this.relatedPath(relation.name);
        return collection.map(function (item) {
            var related = relatedRecords[item[_this.localKey]];
            return _this.setRelated(item, related || [], relatedPath);
        });
    };
    return HasMany;
}(Relation));

var __extends$9 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var HasManyBy = /** @class */ (function (_super) {
    __extends$9(HasManyBy, _super);
    /**
     * Create a new has many by instance.
     */
    function HasManyBy(model, parent, foreignKey, ownerKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.parent = _this.model.relation(parent);
        _this.foreignKey = foreignKey;
        _this.ownerKey = ownerKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    HasManyBy.prototype.fill = function (value) {
        return Array.isArray(value) ? value : [];
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    HasManyBy.prototype.make = function (value, _parent, _key) {
        var _this = this;
        if (value === null) {
            return [];
        }
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [];
        }
        if (value.length === 0) {
            return [];
        }
        return value.filter(function (record) {
            return record && typeof record === 'object';
        }).map(function (record) {
            return new _this.parent(record);
        });
    };
    /**
     * Attach the relational key to the given record.
     */
    HasManyBy.prototype.attach = function (key, record, _data) {
        if (key.length === 0) {
            return;
        }
        if (record[this.foreignKey] !== undefined) {
            return;
        }
        record[this.foreignKey] = key;
    };
    /**
     * Load the has many by relationship for the record.
     */
    HasManyBy.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedPath = this.relatedPath(relation.name);
        var relatedQuery = new Query(query.rootState, this.parent.entity, false);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = this.mapRecords(relatedQuery.get(), this.ownerKey);
        return collection.map(function (item) {
            var related = item[relation.name].reduce(function (related, id) {
                if (relatedRecords[id]) {
                    related.push(relatedRecords[id]);
                }
                return related;
            }, []);
            return _this.setRelated(item, related, relatedPath);
        });
    };
    return HasManyBy;
}(Relation));

var __extends$10 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var HasManyThrough = /** @class */ (function (_super) {
    __extends$10(HasManyThrough, _super);
    /**
     * Create a new has many through instance.
     */
    function HasManyThrough(model, related, through, firstKey, secondKey, localKey, secondLocalKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.related = _this.model.relation(related);
        _this.through = _this.model.relation(through);
        _this.firstKey = firstKey;
        _this.secondKey = secondKey;
        _this.localKey = localKey;
        _this.secondLocalKey = secondLocalKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    HasManyThrough.prototype.fill = function (value) {
        return Array.isArray(value) ? value : [];
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    HasManyThrough.prototype.make = function (value, _parent, _key) {
        var _this = this;
        if (value === null) {
            return [];
        }
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [];
        }
        if (value.length === 0) {
            return [];
        }
        return value.filter(function (record) {
            return record && typeof record === 'object';
        }).map(function (record) {
            return new _this.related(record);
        });
    };
    /**
     * Attach the relational key to the given record.
     */
    HasManyThrough.prototype.attach = function (_key, _record, _data) {
        return;
    };
    /**
     * Load the has many through relationship for the record.
     */
    HasManyThrough.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedQuery = new Query(query.rootState, this.related.entity, false);
        var relatedRecords = relatedQuery.get().reduce(function (records, record) {
            var key = record[_this.secondKey];
            if (!records[key]) {
                records[key] = [];
            }
            records[key].push(record);
            return records;
        }, {});
        this.addConstraint(relatedQuery, relation);
        var throughQuery = new Query(query.rootState, this.through.entity, false);
        var throughRecords = throughQuery.get().reduce(function (records, record) {
            var key = record[_this.firstKey];
            if (!records[key]) {
                records[key] = [];
            }
            if (relatedRecords[record[_this.secondLocalKey]]) {
                records[key] = records[key].concat(relatedRecords[record[_this.secondLocalKey]]);
            }
            return records;
        }, {});
        var relatedPath = this.relatedPath(relation.name);
        return collection.map(function (item) {
            var related = throughRecords[item[_this.localKey]];
            return _this.setRelated(item, related || [], relatedPath);
        });
    };
    return HasManyThrough;
}(Relation));

var __extends$11 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$2 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var BelongsToMany = /** @class */ (function (_super) {
    __extends$11(BelongsToMany, _super);
    /**
     * Create a new belongs to instance.
     */
    function BelongsToMany(model, related, pivot, foreignPivotKey, relatedPivotKey, parentKey, relatedKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.related = _this.model.relation(related);
        _this.pivot = _this.model.relation(pivot);
        _this.foreignPivotKey = foreignPivotKey;
        _this.relatedPivotKey = relatedPivotKey;
        _this.parentKey = parentKey;
        _this.relatedKey = relatedKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    BelongsToMany.prototype.fill = function (value) {
        return Array.isArray(value) ? value : [];
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    BelongsToMany.prototype.make = function (value, _parent, _key) {
        var _this = this;
        if (value === null) {
            return [];
        }
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [];
        }
        if (value.length === 0) {
            return [];
        }
        return value.filter(function (record) {
            return record && typeof record === 'object';
        }).map(function (record) {
            return new _this.related(record);
        });
    };
    /**
     * Attach the relational key to the given record.
     */
    BelongsToMany.prototype.attach = function (_key, _record, _data) {
        return;
    };
    /**
     * Load the belongs to relationship for the record.
     */
    BelongsToMany.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedQuery = new Query(query.rootState, this.related.entity, false);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = relatedQuery.get();
        var related = relatedRecords.reduce(function (records, record) {
            records[record[_this.relatedKey]] = record;
            return records;
        }, {});
        var pivotRecords = new Query(query.rootState, this.pivot.entity).get();
        var pivots = pivotRecords.reduce(function (records, record) {
            if (!records[record[_this.foreignPivotKey]]) {
                records[record[_this.foreignPivotKey]] = [];
            }
            records[record[_this.foreignPivotKey]].push(related[record[_this.relatedPivotKey]]);
            return records;
        }, {});
        return collection.map(function (item) {
            item[relation.name] = pivots[item[_this.parentKey]];
            return item;
        });
    };
    /**
     * Create pivot records for the given records if needed.
     */
    BelongsToMany.prototype.createPivots = function (parent, data, key) {
        var _this = this;
        Utils.forOwn(data[parent.entity], function (record) {
            var related = record[key];
            if (related === undefined || related.length === 0) {
                return;
            }
            _this.createPivotRecord(data, record, related);
        });
        return data;
    };
    /**
     * Create a pivot record.
     */
    BelongsToMany.prototype.createPivotRecord = function (data, record, related) {
        var _this = this;
        related.forEach(function (id) {
            var pivotKey = record[_this.parentKey] + "_" + id;
            data[_this.pivot.entity] = __assign$2({}, data[_this.pivot.entity], (_a = {}, _a[pivotKey] = (_b = {
                    $id: pivotKey
                }, _b[_this.foreignPivotKey] = record[_this.parentKey], _b[_this.relatedPivotKey] = id, _b), _a));
            var _a, _b;
        });
    };
    return BelongsToMany;
}(Relation));

var __extends$12 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MorphTo = /** @class */ (function (_super) {
    __extends$12(MorphTo, _super);
    /**
     * Create a new morph to instance.
     */
    function MorphTo(model, id, type) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.id = id;
        _this.type = type;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    MorphTo.prototype.fill = function (value) {
        if (value === undefined) {
            return null;
        }
        if (Array.isArray(value)) {
            return null;
        }
        return value;
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    MorphTo.prototype.make = function (value, parent, _key) {
        if (value === null) {
            return null;
        }
        if (value === undefined) {
            return null;
        }
        if (Array.isArray(value)) {
            return null;
        }
        var related = parent[this.type];
        var BaseModel = this.model.relation(related);
        return BaseModel ? new BaseModel(value) : null;
    };
    /**
     * Attach the relational key to the given record.
     */
    MorphTo.prototype.attach = function (_key, _record, _data) {
        return;
    };
    /**
     * Load the morph many relationship for the record.
     */
    MorphTo.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedRecords = Object.keys(query.getModels()).reduce(function (records, name) {
            if (name === query.entity) {
                return records;
            }
            var relatedQuery = new Query(query.rootState, name, false);
            _this.addConstraint(relatedQuery, relation);
            records[name] = _this.mapRecords(relatedQuery.get(), '$id');
            return records;
        }, {});
        var relatedPath = this.relatedPath(relation.name);
        return collection.map(function (item) {
            var related = relatedRecords[item[_this.type]][item[_this.id]];
            return _this.setRelated(item, related || null, relatedPath);
        });
    };
    return MorphTo;
}(Relation));

var __extends$13 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MorphOne = /** @class */ (function (_super) {
    __extends$13(MorphOne, _super);
    /**
     * Create a new belongs to instance.
     */
    function MorphOne(model, related, id, type, localKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.related = _this.model.relation(related);
        _this.id = id;
        _this.type = type;
        _this.localKey = localKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    MorphOne.prototype.fill = function (value) {
        if (value === undefined) {
            return null;
        }
        if (Array.isArray(value)) {
            return null;
        }
        return value;
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    MorphOne.prototype.make = function (value, _parent, _key) {
        if (value === null) {
            return null;
        }
        if (value === undefined) {
            return null;
        }
        if (Array.isArray(value)) {
            return null;
        }
        return new this.related(value);
    };
    /**
     * Attach the relational key to the given record.
     */
    MorphOne.prototype.attach = function (_key, _record, _data) {
        return;
    };
    /**
     * Load the morph many relationship for the record.
     */
    MorphOne.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedQuery = new Query(query.rootState, this.related.entity, false);
        relatedQuery.where(this.type, query.entity);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = this.mapRecords(relatedQuery.get(), this.id);
        var relatedPath = this.relatedPath(relation.name);
        return collection.map(function (item) {
            var related = relatedRecords[item[_this.localKey]];
            return _this.setRelated(item, related || null, relatedPath);
        });
    };
    return MorphOne;
}(Relation));

var __extends$14 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MorphMany = /** @class */ (function (_super) {
    __extends$14(MorphMany, _super);
    /**
     * Create a new belongs to instance.
     */
    function MorphMany(model, related, id, type, localKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.related = _this.model.relation(related);
        _this.id = id;
        _this.type = type;
        _this.localKey = localKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    MorphMany.prototype.fill = function (value) {
        return Array.isArray(value) ? value : [];
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    MorphMany.prototype.make = function (value, _parent, _key) {
        var _this = this;
        if (value === null) {
            return [];
        }
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [];
        }
        if (value.length === 0) {
            return [];
        }
        return value.filter(function (record) {
            return record && typeof record === 'object';
        }).map(function (record) {
            return new _this.related(record);
        });
    };
    /**
     * Attach the relational key to the given record.
     */
    MorphMany.prototype.attach = function (_key, _record, _data) {
        return;
    };
    /**
     * Load the morph many relationship for the record.
     */
    MorphMany.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedQuery = new Query(query.rootState, this.related.entity, false);
        relatedQuery.where(this.type, query.entity);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = relatedQuery.get().reduce(function (records, record) {
            var key = record[_this.id];
            if (!records[key]) {
                records[key] = [];
            }
            records[key].push(record);
            return records;
        }, {});
        var relatedPath = this.relatedPath(relation.name);
        return collection.map(function (item) {
            var related = relatedRecords[item[_this.localKey]];
            return _this.setRelated(item, related || [], relatedPath);
        });
    };
    return MorphMany;
}(Relation));

var __extends$15 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$3 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var MorphToMany = /** @class */ (function (_super) {
    __extends$15(MorphToMany, _super);
    /**
     * Create a new belongs to instance.
     */
    function MorphToMany(model, related, pivot, relatedId, id, type, parentKey, relatedKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.related = _this.model.relation(related);
        _this.pivot = _this.model.relation(pivot);
        _this.relatedId = relatedId;
        _this.id = id;
        _this.type = type;
        _this.parentKey = parentKey;
        _this.relatedKey = relatedKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    MorphToMany.prototype.fill = function (value) {
        return Array.isArray(value) ? value : [];
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    MorphToMany.prototype.make = function (value, _parent, _key) {
        var _this = this;
        if (value === null) {
            return [];
        }
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [];
        }
        if (value.length === 0) {
            return [];
        }
        return value.filter(function (record) {
            return record && typeof record === 'object';
        }).map(function (record) {
            return new _this.related(record);
        });
    };
    /**
     * Attach the relational key to the given record.
     */
    MorphToMany.prototype.attach = function (_key, _record, _data) {
        return;
    };
    /**
     * Load the morph many relationship for the record.
     */
    MorphToMany.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedQuery = new Query(query.rootState, this.related.entity, false);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = relatedQuery.get().reduce(function (records, record) {
            records[record[_this.relatedKey]] = record;
            return records;
        }, {});
        var pivotQuery = new Query(query.rootState, this.pivot.entity, false);
        pivotQuery.where(this.type, query.entity);
        var pivotRecords = pivotQuery.get().reduce(function (records, record) {
            if (!records[record[_this.id]]) {
                records[record[_this.id]] = [];
            }
            records[record[_this.id]].push(relatedRecords[record[_this.relatedId]]);
            return records;
        }, {});
        var relatedPath = this.relatedPath(relation.name);
        return collection.map(function (item) {
            var related = pivotRecords[item[_this.parentKey]];
            return _this.setRelated(item, related || [], relatedPath);
        });
    };
    /**
     * Create pivot records for the given records if needed.
     */
    MorphToMany.prototype.createPivots = function (parent, data) {
        var _this = this;
        Utils.forOwn(data[parent.entity], function (record) {
            var related = record[_this.related.entity];
            if (!Array.isArray(related) || related.length === 0) {
                return;
            }
            _this.createPivotRecord(parent, data, record, related);
        });
        return data;
    };
    /**
     * Create a pivot record.
     */
    MorphToMany.prototype.createPivotRecord = function (parent, data, record, related) {
        var _this = this;
        related.forEach(function (id) {
            var parentId = record[_this.parentKey];
            var pivotKey = parentId + "_" + id + "_" + parent.entity;
            data[_this.pivot.entity] = __assign$3({}, data[_this.pivot.entity], (_a = {}, _a[pivotKey] = (_b = {
                    $id: pivotKey
                }, _b[_this.relatedId] = id, _b[_this.id] = parentId, _b[_this.type] = parent.entity, _b), _a));
            var _a, _b;
        });
    };
    return MorphToMany;
}(Relation));

var __extends$16 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$4 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var MorphedByMany = /** @class */ (function (_super) {
    __extends$16(MorphedByMany, _super);
    /**
     * Create a new belongs to instance.
     */
    function MorphedByMany(model, related, pivot, relatedId, id, type, parentKey, relatedKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.related = _this.model.relation(related);
        _this.pivot = _this.model.relation(pivot);
        _this.relatedId = relatedId;
        _this.id = id;
        _this.type = type;
        _this.parentKey = parentKey;
        _this.relatedKey = relatedKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    MorphedByMany.prototype.fill = function (value) {
        return Array.isArray(value) ? value : [];
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    MorphedByMany.prototype.make = function (value, _parent, _key) {
        var _this = this;
        if (value === null) {
            return [];
        }
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [];
        }
        if (value.length === 0) {
            return [];
        }
        return value.filter(function (record) {
            return record && typeof record === 'object';
        }).map(function (record) {
            return new _this.related(record);
        });
    };
    /**
     * Attach the relational key to the given record.
     */
    MorphedByMany.prototype.attach = function (_key, _record, _data) {
        return;
    };
    /**
     * Load the morph many relationship for the record.
     */
    MorphedByMany.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedQuery = new Query(query.rootState, this.related.entity, false);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = relatedQuery.get().reduce(function (records, record) {
            records[record[_this.relatedKey]] = record;
            return records;
        }, {});
        var pivotQuery = new Query(query.rootState, this.pivot.entity, false);
        pivotQuery.where(this.type, relatedQuery.entity);
        var pivotRecords = pivotQuery.get().reduce(function (records, record) {
            if (!records[record[_this.relatedId]]) {
                records[record[_this.relatedId]] = [];
            }
            records[record[_this.relatedId]].push(relatedRecords[record[_this.id]]);
            return records;
        }, {});
        var relatedPath = this.relatedPath(relation.name);
        return collection.map(function (item) {
            var related = pivotRecords[item[_this.parentKey]];
            return _this.setRelated(item, related || [], relatedPath);
        });
    };
    /**
     * Create pivot records for the given records if needed.
     */
    MorphedByMany.prototype.createPivots = function (parent, data) {
        var _this = this;
        Utils.forOwn(data[parent.entity], function (record) {
            var related = record[_this.related.entity];
            if (related.length === 0) {
                return;
            }
            _this.createPivotRecord(data, record, related);
        });
        return data;
    };
    /**
     * Create a pivot record.
     */
    MorphedByMany.prototype.createPivotRecord = function (data, record, related) {
        var _this = this;
        related.forEach(function (id) {
            var parentId = record[_this.parentKey];
            var pivotKey = id + "_" + parentId + "_" + _this.related.entity;
            data[_this.pivot.entity] = __assign$4({}, data[_this.pivot.entity], (_a = {}, _a[pivotKey] = (_b = {
                    $id: pivotKey
                }, _b[_this.relatedId] = parentId, _b[_this.id] = id, _b[_this.type] = _this.related.entity, _b), _a));
            var _a, _b;
        });
    };
    return MorphedByMany;
}(Relation));

var NoKey = /** @class */ (function () {
    function NoKey() {
        /**
         * Current no key value for the keys.
         */
        this.keys = {};
    }
    /**
     * Get no key class.
     */
    NoKey.prototype.self = function () {
        return this.constructor;
    };
    /**
     * Get current no key value for the given key.
     */
    NoKey.prototype.get = function (key) {
        return this.keys[key];
    };
    /**
     * Increment the count, then set new key to the keys.
     */
    NoKey.prototype.increment = function (key) {
        this.self().count++;
        this.keys[key] = "" + this.self().prefix + this.self().count;
        return this.keys[key];
    };
    /**
     * Count to create a unique id for the record that missing its primary key.
     */
    NoKey.count = 0;
    /**
     * Prefix string to be used for undefined primary key value.
     */
    NoKey.prefix = '_no_key_';
    return NoKey;
}());

var IdAttribute = /** @class */ (function () {
    function IdAttribute() {
    }
    /**
     * Create the id attribute.
     */
    IdAttribute.create = function (noKey, model) {
        return function (value, _parent, key) {
            var id = model.id(value);
            return id !== undefined ? id : noKey.get(key);
        };
    };
    return IdAttribute;
}());

var __assign$5 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var ProcessStrategy = /** @class */ (function () {
    function ProcessStrategy() {
    }
    /**
     * Create the process strategy.
     */
    ProcessStrategy.create = function (noKey, model, parent, attr) {
        var _this = this;
        return function (value, parentValue, key) {
            var record = __assign$5({}, value);
            record = _this.fix(record, model);
            record = _this.setId(record, model, noKey, key);
            record = _this.generateMorphFields(record, parentValue, parent, attr);
            return record;
        };
    };
    /**
     * Normalize individual records.
     */
    ProcessStrategy.fix = function (record, model) {
        return this.processFix(record, model.fields());
    };
    /**
     * Normalize individual records.
     */
    ProcessStrategy.processFix = function (record, fields) {
        var _this = this;
        if (record === void 0) { record = {}; }
        var newRecord = {};
        Utils.forOwn(fields, function (field, key) {
            if (record[key] === undefined) {
                return;
            }
            if (field instanceof Attribute) {
                newRecord[key] = field.fill(record[key]);
                return;
            }
            newRecord[key] = _this.processFix(record[key], field);
        });
        return newRecord;
    };
    /**
     * Set id field to the record.
     */
    ProcessStrategy.setId = function (record, model, noKey, key) {
        var id = model.id(record);
        return __assign$5({}, record, { $id: id !== undefined ? id : noKey.increment(key) });
    };
    /**
     * Generate morph fields. This method will generate fileds needed for the
     * morph fields such as `commentable_id` and `commentable_type`.
     */
    ProcessStrategy.generateMorphFields = function (record, parentValue, parent, attr) {
        if (attr === undefined) {
            return record;
        }
        if (!Contract.isMorphRelation(attr)) {
            return record;
        }
        if (parent === undefined) {
            return record;
        }
        return __assign$5((_a = {}, _a[attr.id] = parentValue.$id, _a[attr.type] = parent.entity, _a), record);
        var _a;
    };
    return ProcessStrategy;
}());

var __assign$6 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Schema = /** @class */ (function () {
    function Schema() {
    }
    /**
     * Create a schema for the given model.
     */
    Schema.one = function (model, schemas, parent, attr) {
        if (schemas === void 0) { schemas = {}; }
        var noKey = new NoKey();
        var thisSchema = new src_3.Entity(model.entity, {}, {
            idAttribute: IdAttribute.create(noKey, model),
            processStrategy: ProcessStrategy.create(noKey, model, parent, attr)
        });
        var definition = this.definition(model, __assign$6({}, schemas, (_a = {}, _a[model.entity] = thisSchema, _a)));
        thisSchema.define(definition);
        return thisSchema;
        var _a;
    };
    /**
     * Create an array schema for the given model.
     */
    Schema.many = function (model, schemas, parent, attr) {
        if (schemas === void 0) { schemas = {}; }
        return new src_3.Array(this.one(model, schemas, parent, attr));
    };
    /**
     * Create a dfinition for the given model.
     */
    Schema.definition = function (model, schemas, fields) {
        var _this = this;
        var theFields = fields || model.fields();
        return Object.keys(theFields).reduce(function (definition, key) {
            var field = theFields[key];
            var def = _this.buildRelations(model, field, schemas);
            if (def) {
                definition[key] = def;
            }
            return definition;
        }, {});
    };
    /**
     * Build normalizr schema definition from the given relation.
     */
    Schema.buildRelations = function (model, field, schemas) {
        if (!Contract.isAttribute(field)) {
            return this.definition(model, schemas, field);
        }
        if (field instanceof HasOne) {
            return this.buildOne(field.related, schemas, model, field);
        }
        if (field instanceof BelongsTo) {
            return this.buildOne(field.parent, schemas, model, field);
        }
        if (field instanceof HasMany) {
            return this.buildMany(field.related, schemas, model, field);
        }
        if (field instanceof HasManyBy) {
            return this.buildMany(field.parent, schemas, model, field);
        }
        if (field instanceof HasManyThrough) {
            return this.buildMany(field.related, schemas, model, field);
        }
        if (field instanceof BelongsToMany) {
            return this.buildMany(field.related, schemas, model, field);
        }
        if (field instanceof MorphTo) {
            return this.buildMorphOne(field, schemas, model);
        }
        if (field instanceof MorphOne) {
            return this.buildOne(field.related, schemas, model, field);
        }
        if (field instanceof MorphMany) {
            return this.buildMany(field.related, schemas, model, field);
        }
        if (field instanceof MorphToMany) {
            return this.buildMany(field.related, schemas, model, field);
        }
        if (field instanceof MorphedByMany) {
            return this.buildMany(field.related, schemas, model, field);
        }
        return null;
    };
    /**
     * Build a single entity schema definition.
     */
    Schema.buildOne = function (related, schemas, parent, attr) {
        var s = schemas[related.entity];
        return s || this.one(related, schemas, parent, attr);
    };
    /**
     * Build a array entity schema definition.
     */
    Schema.buildMany = function (related, schemas, parent, attr) {
        var s = schemas[related.entity];
        return s ? new src_3.Array(s) : this.many(related, schemas, parent, attr);
    };
    /**
     * Build a morph schema definition.
     */
    Schema.buildMorphOne = function (attr, schemas, parent) {
        var _this = this;
        var s = Utils.mapValues(parent.conn().models(), function (model) {
            return _this.buildOne(model, schemas, model, attr);
        });
        return new src_3.Union(s, function (_value, parentValue) { return parentValue[attr.type]; });
    };
    return Schema;
}());

var Normalizer = /** @class */ (function () {
    function Normalizer() {
    }
    /**
     * Normalize the data.
     */
    Normalizer.process = function (data, Query) {
        if (Utils.isEmpty(data)) {
            return {};
        }
        var schema = Array.isArray(data) ? Schema.many(Query.model) : Schema.one(Query.model);
        return src_2(data, schema).entities;
    };
    return Normalizer;
}());

var PivotCreator = /** @class */ (function () {
    function PivotCreator() {
    }
    /**
     * Create an intermediate entity if the data contains any entities that
     * require it for example `belongsTo` or `morphMany`.
     */
    PivotCreator.process = function (data, Query) {
        Object.keys(data).forEach(function (entity) {
            var model = Query.getModel(entity);
            if (model.hasPivotFields()) {
                Utils.forOwn(model.pivotFields(), function (field) {
                    Utils.forOwn(field, function (attr, key) { attr.createPivots(model, data, key); });
                });
            }
        });
        return data;
    };
    return PivotCreator;
}());

var Incrementer = /** @class */ (function () {
    function Incrementer() {
    }
    /**
     * Increment all fields that have increment attribute.
     */
    Incrementer.process = function (data, query) {
        var _this = this;
        return Utils.mapValues(data, function (records, entity) {
            var newQuery = query.newPlainQuery(entity);
            // If the entity doesn't have increment attribute, do nothing and
            // just return immediately.
            if (!newQuery.model.hasIncrementFields()) {
                return records;
            }
            _this.processRecordsByFields(records, newQuery);
            return records;
        });
    };
    /**
     * Process all of the increment fields.
     */
    Incrementer.processRecordsByFields = function (records, query) {
        var _this = this;
        var fields = query.model.getIncrementFields();
        Utils.forOwn(fields, function (_attr, key) {
            _this.processRecords(records, query, key);
        });
    };
    /**
     * Process all records and increment all field that is defined as increment.
     */
    Incrementer.processRecords = function (records, query, key) {
        var max = this.max(records, query, key);
        Utils.forOwn(records, function (record) {
            if (!record[key]) {
                record[key] = ++max;
            }
        });
    };
    /**
     * Get the max value of the specified field with given data combined
     * with existing records.
     */
    Incrementer.max = function (records, query, field) {
        var maxInState = query.max(field);
        var maxInRecord = Math.max.apply(Math, Utils.map(records, function (record) { return record[field] || 0; }));
        return Math.max(maxInRecord, maxInState);
    };
    return Incrementer;
}());

var Attacher = /** @class */ (function () {
    function Attacher() {
    }
    /**
     * Attach missing relational key to the records.
     */
    Attacher.process = function (data, Query) {
        Utils.forOwn(data, function (entity, name) {
            var fields = Query.getModel(name).fields();
            Utils.forOwn(entity, function (record) {
                Utils.forOwn(record, function (value, key) {
                    var field = fields[key];
                    if (field instanceof Relation) {
                        field.attach(value, record, data);
                    }
                });
            });
        });
        return data;
    };
    return Attacher;
}());

var __assign$7 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var IdFixer = /** @class */ (function () {
    function IdFixer() {
    }
    /**
     * Fix all of the "no key" records with appropriate id value if it can.
     */
    IdFixer.process = function (data, query) {
        var _this = this;
        return Utils.mapValues(data, function (records, entity) {
            var newQuery = query.newPlainQuery(entity);
            return _this.processRecords(records, newQuery);
        });
    };
    /**
     * Process records to Fix all of the "no key" records with
     * appropriate id value if it can.
     */
    IdFixer.processRecords = function (records, query) {
        return Object.keys(records).reduce(function (newRecords, id) {
            var record = records[id];
            var newId = query.model.id(record);
            var newStringId = isNaN(newId) ? newId : newId.toString();
            if (newId === undefined || id === newStringId) {
                newRecords[id] = record;
                return newRecords;
            }
            newRecords[newStringId] = __assign$7({}, record, { $id: newId });
            return newRecords;
        }, {});
    };
    return IdFixer;
}());

var Data = /** @class */ (function () {
    function Data() {
    }
    /**
     * Normalize the data.
     */
    Data.normalize = function (data, query) {
        data = Normalizer.process(data, query);
        data = PivotCreator.process(data, query);
        data = Incrementer.process(data, query);
        data = Attacher.process(data, query);
        data = IdFixer.process(data, query);
        return data;
    };
    return Data;
}());

var Hook = /** @class */ (function () {
    /**
     * Create a lidecycle hook instance.
     */
    function Hook(query) {
        this.query = query;
    }
    /**
     * Register a callback. It Returns unique ID for registered callback.
     */
    Hook.on = function (on, callback, once) {
        if (once === void 0) { once = false; }
        var uid = this.lastHookId + 1;
        this.lastHookId = uid;
        if (!this.hooks[on]) {
            this.hooks[on] = [];
        }
        this.hooks[on].push({ callback: callback, once: once, uid: uid });
        return uid;
    };
    /**
     * Remove hook registration.
     */
    Hook.off = function (uid) {
        var _this = this;
        var removed = false;
        Object.keys(this.hooks).some(function (on) {
            var hook = _this.hooks[on];
            var index = hook.findIndex(function (h) { return h.uid === uid; });
            if (index !== -1) {
                hook.splice(index, 1);
                removed = true;
            }
            return removed;
        });
        return removed;
    };
    /**
     * Get the hook class.
     */
    Hook.prototype.self = function () {
        return this.constructor;
    };
    /**
     * Get the action hook.
     */
    Hook.prototype.getActionHook = function (name) {
        if (!this.query.actionContext) {
            return null;
        }
        var hook = this.query.module.actions && this.query.module.actions[name];
        return hook || null;
    };
    /**
     * Get the global hook.
     */
    Hook.prototype.getGlobalHook = function (name) {
        if (!this.self().hooks[name]) {
            return null;
        }
        return this.self().hooks[name];
    };
    /**
     * Check if the given hook exist.
     */
    Hook.prototype.has = function (name) {
        return !!this.getActionHook(name) || !!this.getGlobalHook(name);
    };
    /**
     * Execute the callback of the given hook.
     */
    Hook.prototype.execute = function (on, data) {
        if (!this.has(on)) {
            return data;
        }
        data = this.executeActionHook(on, data);
        data = this.executeGlobalHook(on, data);
        return data;
    };
    /**
     * Execute the action hook.
     */
    Hook.prototype.executeActionHook = function (on, data) {
        if (!this.query.actionContext) {
            return data;
        }
        var hook = this.getActionHook(on);
        if (!hook) {
            return data;
        }
        var result = hook(this.query.actionContext, data);
        if (result === false) {
            return false;
        }
        return result || data;
    };
    /**
     * Execute the global callback of the given hook.
     */
    Hook.prototype.executeGlobalHook = function (on, data) {
        var _this = this;
        if (data === false) {
            return false;
        }
        var hooks = this.getGlobalHook(on);
        if (!hooks) {
            return data;
        }
        // Track indexes to delete.
        var deleteHookIndexes = [];
        // Loop all hooks.
        hooks.forEach(function (hook, hookIndex) {
            var callback = hook.callback, once = hook.once;
            data = callback.call(_this.query, data, _this.query.entity);
            // Add hook index to delete.
            once && deleteHookIndexes.push(hookIndex);
        });
        // Remove hooks to be deleted in reverse order.
        deleteHookIndexes.reverse().forEach(function (hookIndex) {
            hooks.splice(hookIndex, 1);
        });
        return data;
    };
    /**
     * Execute the callback for all given records.
     */
    Hook.prototype.executeOnRecords = function (on, records) {
        var _this = this;
        if (!this.has(on)) {
            return records;
        }
        return Object.keys(records).reduce(function (newRecords, id) {
            var record = records[id];
            var result = _this.execute(on, record);
            if (result === false) {
                return newRecords;
            }
            newRecords[id] = result;
            return newRecords;
        }, {});
    };
    /**
     * Execute the callback for the given collection.
     */
    Hook.prototype.executeOnCollection = function (on, collection) {
        var _this = this;
        if (!this.has(on)) {
            return collection;
        }
        collection.map(function (item) { _this.execute(on, item); });
        return collection;
    };
    /**
     * Global lifecycle hooks for the query.
     */
    Hook.hooks = {};
    /**
     * Hook UID counter.
     */
    Hook.lastHookId = 0;
    return Hook;
}());

var __assign$8 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Query = /** @class */ (function () {
    /**
     * Create a new Query instance.
     */
    function Query(state, entity, wrap) {
        if (wrap === void 0) { wrap = true; }
        /**
         * The where constraints for the query.
         */
        this.wheres = [];
        /**
         * The orders of the query result.
         */
        this.orders = [];
        /**
         * Number of results to skip.
         */
        this._offset = 0;
        /**
         * Maximum number of records to return.
         *
         * We use polyfill of `Number.MAX_SAFE_INTEGER` for IE11 here.
         */
        this._limit = Math.pow(2, 53) - 1;
        /**
         * The relationships that should be loaded with the result.
         */
        this.load = [];
        /**
         * The Vuex Action context.
         */
        this.actionContext = null;
        this.rootState = state;
        this.state = state[entity];
        this.entity = entity;
        this.model = this.getModel(entity);
        this.module = this.getModule(entity);
        this.hook = new Hook(this);
        this.wrap = wrap;
    }
    /**
     * Create a new query instance
     */
    Query.query = function (state, name, wrap) {
        return new this(state, name, wrap);
    };
    /**
     * Get model of given name from the container.
     */
    Query.getModel = function (state, name) {
        return Container.connection(state.$name).model(name);
    };
    /**
     * Get all models from the container.
     */
    Query.getModels = function (state) {
        return Container.connection(state.$name).models();
    };
    /**
     * Get module of given name from the container.
     */
    Query.getModule = function (state, name) {
        return Container.connection(state.$name).module(name);
    };
    /**
     * Get all modules from the container.
     */
    Query.getModules = function (state) {
        return Container.connection(state.$name).modules();
    };
    /**
     * Save new data to the state. It will remove all existing data in the
     * state. If you want to keep existing data while saving new data,
     * use `insert` instead.
     */
    Query.create = function (state, entity, data, options) {
        return (new this(state, entity)).create(data, options);
    };
    /**
     * Commit `create` to the state.
     */
    Query.commitCreate = function (state, entity, records) {
        (new this(state, entity)).commitCreate(records);
    };
    /**
     * Insert given data to the state. Unlike `create`, this method will not
     * remove existing data within the state, but it will update the data
     * with the same primary key.
     */
    Query.insert = function (state, entity, data, options) {
        return (new this(state, entity)).insert(data, options);
    };
    /**
     * Commit `insert` to the state.
     */
    Query.commitInsert = function (state, entity, data) {
        (new this(state, entity)).commitInsert(data);
    };
    /**
     * Update data in the state.
     */
    Query.update = function (state, entity, data, condition, options) {
        return (new this(state, entity)).update(data, condition, options);
    };
    /**
     * Commit `update` to the state.
     */
    Query.commitUpdate = function (state, entity, data) {
        (new this(state, entity)).commitUpdate(data);
    };
    /**
     * Insert or update given data to the state. Unlike `insert`, this method
     * will not replace existing data within the state, but it will update only
     * the submitted data with the same primary key.
     */
    Query.insertOrUpdate = function (state, entity, data, options) {
        return (new this(state, entity)).insertOrUpdate(data, options);
    };
    /**
     * Get all data of the given entity from the state.
     */
    Query.all = function (state, entity, wrap) {
        return (new this(state, entity, wrap)).get();
    };
    /**
     * Get the record of the given id.
     */
    Query.find = function (state, entity, id, wrap) {
        return (new this(state, entity, wrap)).find(id);
    };
    /**
     * Get the count of the retrieved data.
     */
    Query.count = function (state, entity, wrap) {
        return (new this(state, entity, wrap)).count();
    };
    /**
     * Get the max value of the specified filed.
     */
    Query.max = function (state, entity, field, wrap) {
        return (new this(state, entity, wrap)).max(field);
    };
    /**
     * Get the min value of the specified filed.
     */
    Query.min = function (state, entity, field, wrap) {
        return (new this(state, entity, wrap)).min(field);
    };
    /**
     * Delete a record from the state.
     */
    Query.delete = function (state, entity, condition) {
        return (new this(state, entity)).delete(condition);
    };
    /**
     * Delete all records from the state.
     */
    Query.deleteAll = function (state, entity) {
        var _this = this;
        if (entity) {
            return (new this(state, entity)).deleteAll();
        }
        var models = this.getModels(state);
        Utils.forOwn(models, function (_model, name) {
            state[name] && (new _this(state, name)).deleteAll();
        });
    };
    /**
     * Commit `delete` to the state.
     */
    Query.commitDelete = function (state, entity, ids) {
        (new Query(state, entity)).commitDelete(ids);
    };
    /**
     * Register a callback. It Returns unique ID for registered callback.
     */
    Query.on = function (on, callback, once) {
        return Hook.on(on, callback, once);
    };
    /**
     * Remove hook registration.
     */
    Query.off = function (uid) {
        return Hook.off(uid);
    };
    /**
     * Get query class.
     */
    Query.prototype.self = function () {
        return this.constructor;
    };
    /**
     * Create a new query instance.
     */
    Query.prototype.newQuery = function (entity) {
        return (new Query(this.rootState, entity)).setActionContext(this.actionContext);
    };
    /**
     * Create a new query instance with wrap property set to false.
     */
    Query.prototype.newPlainQuery = function (entity) {
        return (new Query(this.rootState, entity)).plain();
    };
    /**
     * Get model of given name from the container.
     */
    Query.prototype.getModel = function (name) {
        var entity = name || this.entity;
        return this.self().getModel(this.rootState, entity);
    };
    /**
     * Get all models from the container.
     */
    Query.prototype.getModels = function () {
        return this.self().getModels(this.rootState);
    };
    /**
     * Get module of given name from the container.
     */
    Query.prototype.getModule = function (name) {
        var entity = name || this.entity;
        return this.self().getModule(this.rootState, entity);
    };
    /**
     * Get all modules from the container.
     */
    Query.prototype.getModules = function () {
        return this.self().getModules(this.rootState);
    };
    /**
     * Commit changes to the state. This method will call mutation name of
     * `method` with `payload` if the method is called from an action to
     * avoid mutating state change outside of mutation handler.
     */
    Query.prototype.commit = function (method, payload, callback) {
        if (!this.actionContext) {
            callback();
            return;
        }
        payload = __assign$8({ entity: this.entity }, payload);
        this.actionContext.commit(this.rootState.$name + "/" + method, payload, { root: true });
    };
    /**
     * Set wrap flag to false.
     */
    Query.prototype.plain = function () {
        this.wrap = false;
        return this;
    };
    /**
     * Set Vuex Action Context to the query.
     */
    Query.prototype.setActionContext = function (context) {
        this.actionContext = context;
        return this;
    };
    /**
     * Save new data to the state. It will remove all existing data in the
     * state. If you want to keep existing data while saving new data,
     * use `insert` instead.
     */
    Query.prototype.create = function (data, options) {
        return this.persist(data, 'create', options);
    };
    /**
     * Create records to the state.
     */
    Query.prototype.createMany = function (records) {
        records = this.model.hydrateMany(records);
        records = this.hook.executeOnRecords('beforeCreate', records);
        this.commitCreate(records);
        var collection = this.collect(this.records(records));
        return this.hook.executeOnCollection('afterCreate', collection);
    };
    /**
     * Commit `create` to the state.
     */
    Query.prototype.commitCreate = function (data) {
        var _this = this;
        this.commit('commitCreate', { data: data }, function () {
            _this.state.data = data;
        });
    };
    /**
     * Insert given data to the state. Unlike `create`, this method will not
     * remove existing data within the state, but it will update the data
     * with the same primary key.
     */
    Query.prototype.insert = function (data, options) {
        return this.persist(data, 'insert', options);
    };
    /**
     * Insert list of records in the state.
     */
    Query.prototype.insertMany = function (records) {
        records = this.model.hydrateMany(records);
        records = this.hook.executeOnRecords('beforeCreate', records);
        this.commitInsert(records);
        var collection = this.collect(this.records(records));
        return this.hook.executeOnCollection('afterCreate', collection);
    };
    /**
     * Commit `insert` to the state.
     */
    Query.prototype.commitInsert = function (data) {
        var _this = this;
        this.commit('commitInsert', { data: data }, function () {
            _this.state.data = __assign$8({}, _this.state.data, data);
        });
    };
    /**
     * Update data in the state.
     */
    Query.prototype.update = function (data, condition, options) {
        if (Array.isArray(data)) {
            return this.persist(data, 'update', options);
        }
        if (typeof condition === 'function') {
            return this.updateByCondition(data, condition);
        }
        if (!condition) {
            return this.persist(data, 'update', options);
        }
        return this.updateById(data, condition);
    };
    /**
     * Update all records.
     */
    Query.prototype.updateMany = function (records) {
        var _this = this;
        var toBeUpdated = {};
        records = this.model.fixMany(records, []);
        Utils.forOwn(records, function (record, id) {
            var state = _this.state.data[id];
            if (!state) {
                return;
            }
            var newState = JSON.parse(JSON.stringify(state));
            _this.merge(record, newState);
            toBeUpdated[id] = newState;
        });
        toBeUpdated = this.hook.executeOnRecords('beforeUpdate', toBeUpdated);
        this.commitUpdate(toBeUpdated);
        var collection = this.collect(this.records(toBeUpdated));
        this.hook.executeOnCollection('afterUpdate', collection);
        return collection;
    };
    /**
     * Update the state by id.
     */
    Query.prototype.updateById = function (data, id) {
        id = typeof id === 'number' ? id.toString() : id;
        var state = this.state.data[id];
        if (!state) {
            return null;
        }
        var record = JSON.parse(JSON.stringify(state));
        typeof data === 'function' ? data(record) : this.merge(this.model.fix(data), record);
        var hookResult = this.hook.execute('beforeUpdate', record);
        if (hookResult === false) {
            return null;
        }
        this.commitUpdate((_a = {}, _a[id] = hookResult, _a));
        var item = this.item(hookResult);
        this.hook.execute('afterUpdate', item);
        return item;
        var _a;
    };
    /**
     * Update the state by condition.
     */
    Query.prototype.updateByCondition = function (data, condition) {
        var _this = this;
        var toBeUpdated = {};
        Utils.forOwn(this.state.data, function (record, id) {
            if (!condition(record)) {
                return;
            }
            var state = JSON.parse(JSON.stringify(record));
            typeof data === 'function' ? data(state) : _this.merge(_this.model.fix(data), state);
            toBeUpdated[id] = state;
        });
        toBeUpdated = this.hook.executeOnRecords('beforeUpdate', toBeUpdated);
        this.commitUpdate(toBeUpdated);
        var collection = this.collect(this.records(toBeUpdated));
        this.hook.executeOnCollection('afterUpdate', collection);
        return collection;
    };
    /**
     * Commit `update` to the state.
     */
    Query.prototype.commitUpdate = function (data) {
        var _this = this;
        this.commit('commitUpdate', { data: data }, function () {
            _this.state.data = __assign$8({}, _this.state.data, data);
        });
    };
    /**
     * Insert or update given data to the state. Unlike `insert`, this method
     * will not replace existing data within the state, but it will update only
     * the submitted data with the same primary key.
     */
    Query.prototype.insertOrUpdate = function (data, options) {
        return this.persist(data, 'insertOrUpdate', options);
    };
    /**
     * Insert or update the records.
     */
    Query.prototype.insertOrUpdateMany = function (records) {
        var _this = this;
        var toBeInserted = {};
        var toBeUpdated = {};
        Utils.forOwn(records, function (record, id) {
            if (_this.state.data[id]) {
                toBeUpdated[id] = record;
                return;
            }
            toBeInserted[id] = record;
        });
        return this.collect(this.insertMany(toBeInserted).concat(this.updateMany(toBeUpdated)));
    };
    /**
     * Persist data into the state.
     */
    Query.prototype.persist = function (data, method, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        data = this.normalize(data);
        if (Utils.isEmpty(data)) {
            method === 'create' && this.commitCreate({});
            return {};
        }
        return Object.keys(data).reduce(function (collection, entity) {
            var query = _this.newQuery(entity);
            var persistMethod = _this.getPersistMethod(entity, method, options);
            var records = query[persistMethod + "Many"](data[entity]);
            if (records.length > 0) {
                collection[entity] = records;
            }
            return collection;
        }, {});
    };
    /**
     * Get method for the persist.
     */
    Query.prototype.getPersistMethod = function (entity, method, options) {
        if (options.create && options.create.includes(entity)) {
            return 'create';
        }
        if (options.insert && options.insert.includes(entity)) {
            return 'insert';
        }
        if (options.update && options.update.includes(entity)) {
            return 'update';
        }
        if (options.insertOrUpdate && options.insertOrUpdate.includes(entity)) {
            return 'insertOrUpdate';
        }
        return method;
    };
    /**
     * Normalize the given data.
     */
    Query.prototype.normalize = function (data) {
        return Data.normalize(data, this);
    };
    /**
     * Update the state value by merging the given record and state.
     */
    Query.prototype.merge = function (data, state, fields) {
        var _this = this;
        var theFields = fields || this.model.fields();
        Utils.forOwn(data, function (value, key) {
            var field = theFields[key];
            if (field instanceof Attribute) {
                state[key] = value;
                return;
            }
            _this.merge(value, state[key], field);
        });
    };
    /**
     * Returns all record of the query chain result. This method is alias
     * of the `get` method.
     */
    Query.prototype.all = function () {
        return this.get();
    };
    /**
     * Get the record of the given id.
     */
    Query.prototype.find = function (id) {
        var record = this.state.data[id];
        if (!record) {
            return null;
        }
        return this.item(__assign$8({}, record));
    };
    /**
     * Returns all record of the query chain result.
     */
    Query.prototype.get = function () {
        var records = this.process();
        return this.collect(records);
    };
    /**
     * Returns the first record of the query chain result.
     */
    Query.prototype.first = function () {
        var records = this.process();
        return this.item(records[0]);
    };
    /**
     * Returns the last single record of the query chain result.
     */
    Query.prototype.last = function () {
        var records = this.process();
        var last = records.length - 1;
        return this.item(records[last]);
    };
    /**
     * Get all the records from the state and convert them into the array.
     * If you pass records, it will create an array out of that records
     * instead of the store state.
     */
    Query.prototype.records = function (records) {
        var theRecords = records || this.state.data;
        return Object.keys(theRecords).map(function (id) { return (__assign$8({}, theRecords[id])); });
    };
    /**
     * Add a and where clause to the query.
     */
    Query.prototype.where = function (field, value) {
        this.wheres.push({ field: field, value: value, boolean: 'and' });
        return this;
    };
    /**
     * Add a or where clause to the query.
     */
    Query.prototype.orWhere = function (field, value) {
        this.wheres.push({ field: field, value: value, boolean: 'or' });
        return this;
    };
    /**
     * Add an order to the query.
     */
    Query.prototype.orderBy = function (field, direction) {
        if (direction === void 0) { direction = 'asc'; }
        this.orders.push({ field: field, direction: direction });
        return this;
    };
    /**
     * Add an offset to the query.
     */
    Query.prototype.offset = function (offset) {
        this._offset = offset;
        return this;
    };
    /**
     * Add limit to the query.
     */
    Query.prototype.limit = function (limit) {
        this._limit = limit;
        return this;
    };
    /**
     * Set the relationships that should be loaded.
     */
    Query.prototype.with = function (name, constraint) {
        if (constraint === void 0) { constraint = null; }
        if (name === '*') {
            this.withAll();
        }
        else {
            this.load.push({ name: name, constraint: constraint });
        }
        return this;
    };
    /**
     * Query all relations.
     */
    Query.prototype.withAll = function (constraints) {
        if (constraints === void 0) { constraints = function () { return null; }; }
        var fields = this.model.fields();
        for (var field in fields) {
            if (Contract.isRelation(fields[field])) {
                this.load.push({ name: field, constraint: constraints(field) });
            }
        }
        return this;
    };
    /**
     * Query all relations recursively.
     */
    Query.prototype.withAllRecursive = function (depth) {
        if (depth === void 0) { depth = 3; }
        this.withAll(function () {
            return depth > 0 ? function (query) {
                query.withAllRecursive(depth - 1);
            } : null;
        });
        return this;
    };
    /**
     * Set where constraint based on relationship existence.
     */
    Query.prototype.has = function (name, constraint, count) {
        return this.addHasConstraint(name, constraint, count, true);
    };
    /**
     * Set where constraint based on relationship absence.
     */
    Query.prototype.hasNot = function (name, constraint, count) {
        return this.addHasConstraint(name, constraint, count, false);
    };
    /**
     * Add where constraints based on has or hasNot condition.
     */
    Query.prototype.addHasConstraint = function (name, constraint, count, existence) {
        var ids = this.matchesHasRelation(name, constraint, count, existence);
        this.where('$id', function (value) { return ids.includes(value); });
        return this;
    };
    /**
     * Add where has condition.
     */
    Query.prototype.whereHas = function (name, constraint) {
        return this.addWhereHasConstraint(name, constraint, true);
    };
    /**
     * Add where has not condition.
     */
    Query.prototype.whereHasNot = function (name, constraint) {
        return this.addWhereHasConstraint(name, constraint, false);
    };
    /**
     * Add where has constraints that only matches the relationship constraint.
     */
    Query.prototype.addWhereHasConstraint = function (name, constraint, existence) {
        var ids = this.matchesWhereHasRelation(name, constraint, existence);
        this.where('$id', function (value) { return ids.includes(value); });
        return this;
    };
    /**
     * Process the query and filter data.
     */
    Query.prototype.process = function () {
        var records = this.records();
        // Process `beforeProcess` hook.
        records = this.hook.execute('beforeProcess', records);
        // If the where clause is registered, lets filter the records beased on it.
        if (!Utils.isEmpty(this.wheres)) {
            records = this.selectByWheres(records);
        }
        // Process `afterWhere` hook.
        records = this.hook.execute('afterWhere', records);
        // Next, lets sort the data if orderBy is registred.
        if (!Utils.isEmpty(this.orders)) {
            records = this.sortByOrders(records);
        }
        // Process `afterOrderBy` hook.
        records = this.hook.execute('afterOrderBy', records);
        // Finally, slice the record by limit and offset.
        records = records.slice(this._offset, this._offset + this._limit);
        // Process `afterLimit` hook.
        records = this.hook.execute('afterLimit', records);
        return records;
    };
    /**
     * Filter the given data by registered where clause.
     */
    Query.prototype.selectByWheres = function (records) {
        var _this = this;
        return records.filter(function (record) { return _this.whereOnRecord(record); });
    };
    /**
     * Sort the given data by registered orders.
     */
    Query.prototype.sortByOrders = function (records) {
        var keys = this.orders.map(function (order) { return order.field; });
        var directions = this.orders.map(function (order) { return order.direction; });
        return Utils.orderBy(records, keys, directions);
    };
    /**
     * Checks if given Record matches the registered where clause.
     */
    Query.prototype.whereOnRecord = function (record) {
        var whereTypes = Utils.groupBy(this.wheres, function (where) { return where.boolean; });
        var whereResults = [];
        var comparator = this.getComparator(record);
        if (whereTypes.and) {
            whereResults.push(whereTypes.and.every(comparator));
        }
        if (whereTypes.or) {
            whereResults.push(whereTypes.or.some(comparator));
        }
        return whereResults.indexOf(true) !== -1;
    };
    /**
     * Get comparator for the where clause.
     */
    Query.prototype.getComparator = function (record) {
        var _this = this;
        return function (where) {
            // Function with Record and Query as argument.
            if (typeof where.field === 'function') {
                var query = new Query(_this.rootState, _this.entity);
                var result = _this.executeWhereClosure(record, query, where.field);
                if (typeof result === 'boolean') {
                    return result;
                }
                return !Utils.isEmpty(query.where('$id', record['$id']).get());
            }
            // Function with Record value as argument.
            if (typeof where.value === 'function') {
                return where.value(record[where.field]);
            }
            // Check if field value is in given where Array.
            if (Array.isArray(where.value)) {
                return where.value.indexOf(record[where.field]) !== -1;
            }
            // Simple equal check.
            return record[where.field] === where.value;
        };
    };
    /**
     * Execute where closure.
     */
    Query.prototype.executeWhereClosure = function (record, query, closure) {
        if (closure.length !== 3) {
            return closure(record, query);
        }
        var model = new this.model(record);
        return closure(record, query, model);
    };
    /**
     * Get the count of the retrieved data.
     */
    Query.prototype.count = function () {
        // Do not wrap result data with class because it's unnecessary.
        this.wrap = false;
        return this.get().length;
    };
    /**
     * Get the max value of the specified filed.
     */
    Query.prototype.max = function (field) {
        // Do not wrap result data with class because it's unnecessary.
        this.wrap = false;
        var numbers = this.get().reduce(function (numbers, item) {
            if (typeof item[field] === 'number') {
                numbers.push(item[field]);
            }
            return numbers;
        }, []);
        return numbers.length === 0 ? 0 : Math.max.apply(Math, numbers);
    };
    /**
     * Get the min value of the specified filed.
     */
    Query.prototype.min = function (field) {
        // Do not wrap result data with class because it's unnecessary.
        this.wrap = false;
        var numbers = this.get().reduce(function (numbers, item) {
            if (typeof item[field] === 'number') {
                numbers.push(item[field]);
            }
            return numbers;
        }, []);
        return numbers.length === 0 ? 0 : Math.min.apply(Math, numbers);
    };
    /**
     * Create a item from given record.
     */
    Query.prototype.item = function (queryItem) {
        if (!queryItem) {
            return null;
        }
        var item = queryItem;
        if (!Utils.isEmpty(this.load)) {
            item = this.loadRelations([item])[0];
        }
        if (!this.wrap) {
            return item;
        }
        return new this.model(item);
    };
    /**
     * Create a collection (array) from given records.
     */
    Query.prototype.collect = function (collection) {
        var _this = this;
        if (Utils.isEmpty(collection)) {
            return [];
        }
        var item = collection;
        if (!Utils.isEmpty(this.load)) {
            item = this.loadRelations(item);
        }
        if (!this.wrap) {
            return item;
        }
        return item.map(function (data) { return new _this.model(data); });
    };
    /**
     * Load the relationships for the record.
     */
    Query.prototype.loadRelations = function (data, relation) {
        var _this = this;
        var _relation = relation || this.load;
        var fields = this.model.fields();
        return _relation.reduce(function (records, rel) {
            return _this.processLoadRelations(records, rel, fields);
        }, data);
    };
    /**
     * Process load relationships. This method is for the circuler processes.
     */
    Query.prototype.processLoadRelations = function (data, relation, fields) {
        var _this = this;
        var relationName = relation.name.split('.')[0];
        var collection = data;
        Object.keys(fields).some(function (key) {
            var field = fields[key];
            if (key === relationName) {
                if (field instanceof Relation) {
                    collection = field.load(_this, collection, relation);
                }
                return true;
            }
            if (field instanceof Attribute) {
                return false;
            }
            collection = _this.processLoadRelations(collection, relation, field);
            return false;
        });
        return collection;
    };
    /**
     * Check if the given collection has given relationship.
     */
    Query.prototype.matchesHasRelation = function (name, constraint, count, existence) {
        if (existence === void 0) { existence = true; }
        var _constraint;
        if (constraint === undefined) {
            _constraint = function (record) { return record.length >= 1; };
        }
        else if (typeof constraint === 'number') {
            _constraint = function (record) { return record.length >= constraint; };
        }
        else if (constraint === '=' && typeof count === 'number') {
            _constraint = function (record) { return record.length === count; };
        }
        else if (constraint === '>' && typeof count === 'number') {
            _constraint = function (record) { return record.length > count; };
        }
        else if (constraint === '>=' && typeof count === 'number') {
            _constraint = function (record) { return record.length >= count; };
        }
        else if (constraint === '<' && typeof count === 'number') {
            _constraint = function (record) { return record.length < count; };
        }
        else if (constraint === '<=' && typeof count === 'number') {
            _constraint = function (record) { return record.length <= count; };
        }
        var data = (new Query(this.rootState, this.entity, false)).with(name).get();
        var ids = [];
        data.forEach(function (item) {
            var target = item[name];
            var result = false;
            if (!target) {
                result = false;
            }
            else if (Array.isArray(target) && target.length < 1) {
                result = false;
            }
            else if (Array.isArray(target)) {
                result = _constraint(target);
            }
            else if (target) {
                result = _constraint([target]);
            }
            if (result !== existence) {
                return;
            }
            ids.push(item.$id);
        });
        return ids;
    };
    /**
     * Get all id of the record that matches the relation constraints.
     */
    Query.prototype.matchesWhereHasRelation = function (name, constraint, existence) {
        if (existence === void 0) { existence = true; }
        var data = (new Query(this.rootState, this.entity, false)).with(name, constraint).get();
        var ids = [];
        data.forEach(function (item) {
            var target = item[name];
            var result = Array.isArray(target) ? !!target.length : !!target;
            if (result !== existence) {
                return;
            }
            ids.push(item.$id);
        });
        return ids;
    };
    /**
     * Delete records from the state.
     */
    Query.prototype.delete = function (condition) {
        if (typeof condition === 'function') {
            return this.deleteByCondition(condition);
        }
        return this.deleteById(condition);
    };
    /**
     * Delete a record by id.
     */
    Query.prototype.deleteById = function (id) {
        id = typeof id === 'number' ? id.toString() : id;
        var state = this.state.data[id];
        if (!state) {
            return null;
        }
        var hookResult = this.hook.execute('beforeDelete', state);
        if (hookResult === false) {
            return null;
        }
        this.commitDelete([id]);
        var item = this.item(hookResult);
        this.hook.execute('afterDelete', item);
        return item;
    };
    /**
     * Delete record by condition.
     */
    Query.prototype.deleteByCondition = function (condition) {
        var toBeDeleted = {};
        Utils.forOwn(this.state.data, function (record, id) {
            if (!condition(record)) {
                return;
            }
            toBeDeleted[id] = record;
        });
        toBeDeleted = this.hook.executeOnRecords('beforeDelete', toBeDeleted);
        this.commitDelete(Object.keys(toBeDeleted));
        var collection = this.collect(this.records(toBeDeleted));
        this.hook.executeOnCollection('afterDelete', collection);
        return collection;
    };
    /**
     * Delete all records from the state.
     */
    Query.prototype.deleteAll = function () {
        var toBeDeleted = this.state.data;
        toBeDeleted = this.hook.executeOnRecords('beforeDelete', toBeDeleted);
        this.commitDelete(Object.keys(toBeDeleted));
        var collection = this.collect(this.records(toBeDeleted));
        this.hook.executeOnCollection('afterDelete', collection);
        return collection;
    };
    /**
     * Commit `delete` to the state.
     */
    Query.prototype.commitDelete = function (ids) {
        var _this = this;
        this.commit('commitDelete', { ids: ids }, function () {
            _this.state.data = Object.keys(_this.state.data).reduce(function (state, id) {
                if (!ids.includes(id)) {
                    state[id] = _this.state.data[id];
                }
                return state;
            }, {});
        });
    };
    return Query;
}());

var __extends$17 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var HasOne = /** @class */ (function (_super) {
    __extends$17(HasOne, _super);
    /**
     * Create a new has one instance.
     */
    function HasOne(model, related, foreignKey, localKey) {
        var _this = _super.call(this, model) /* istanbul ignore next */ || this;
        _this.related = _this.model.relation(related);
        _this.foreignKey = foreignKey;
        _this.localKey = localKey;
        return _this;
    }
    /**
     * Transform given data to the appropriate value. This method will be called
     * during data normalization to fix field that has an incorrect value,
     * or add a missing field with the appropriate default value.
     */
    HasOne.prototype.fill = function (value) {
        if (value === undefined) {
            return null;
        }
        if (Array.isArray(value)) {
            return null;
        }
        return value;
    };
    /**
     * Make value to be set to BaseModel property. This method is used when
     * instantiating a BaseModel or creating a plain object from a BaseModel.
     */
    HasOne.prototype.make = function (value, _parent, _key) {
        if (value === null) {
            return null;
        }
        if (value === undefined) {
            return null;
        }
        if (Array.isArray(value)) {
            return null;
        }
        return new this.related(value);
    };
    /**
     * Attach the relational key to the given record.
     */
    HasOne.prototype.attach = function (key, record, data) {
        var related = data[this.related.entity];
        if (related && related[key] && related[key][this.foreignKey] !== undefined) {
            return;
        }
        if (!record[this.localKey]) {
            record[this.localKey] = record.$id;
        }
        related[key][this.foreignKey] = record[this.localKey];
    };
    /**
     * Load the has one relationship for the record.
     */
    HasOne.prototype.load = function (query, collection, relation) {
        var _this = this;
        var relatedPath = this.relatedPath(relation.name);
        var relatedQuery = new Query(query.rootState, this.related.entity, false);
        this.addConstraint(relatedQuery, relation);
        var relatedRecords = this.mapRecords(relatedQuery.get(), this.foreignKey);
        return collection.map(function (item) {
            var related = relatedRecords[item[_this.localKey]];
            return _this.setRelated(item, related || null, relatedPath);
        });
    };
    return HasOne;
}(Relation));

var Contract = /** @class */ (function () {
    function Contract() {
    }
    /**
     * Determine if the given value is the type of fields.
     */
    Contract.isFields = function (attr) {
        return !this.isAttribute(attr);
    };
    /**
     * Determine if the given value is the type of field.
     */
    Contract.isAttribute = function (attr) {
        return attr instanceof Attr
            || attr instanceof String$1
            || attr instanceof Number
            || attr instanceof Boolean
            || attr instanceof Increment
            || this.isRelation(attr);
    };
    /**
     * Determine if the given value is the type of relations.
     */
    Contract.isRelation = function (attr) {
        return attr instanceof HasOne
            || attr instanceof BelongsTo
            || attr instanceof HasMany
            || attr instanceof HasManyBy
            || attr instanceof HasManyThrough
            || attr instanceof BelongsToMany
            || attr instanceof MorphTo
            || attr instanceof MorphOne
            || attr instanceof MorphMany
            || attr instanceof MorphToMany
            || attr instanceof MorphedByMany;
    };
    /**
     * Determine if the given value is the type of morph relations.
     */
    Contract.isMorphRelation = function (attr) {
        return attr instanceof MorphOne || attr instanceof MorphMany;
    };
    return Contract;
}());

var BaseModel = /** @class */ (function () {
    /**
     * Create a model instance.
     */
    function BaseModel(record) {
        this.$fill(record);
    }
    /**
     * The definition of the fields of the model and its relations.
     */
    BaseModel.fields = function () {
        return {};
    };
    /**
     * Create an attr attribute. The given value will be used as a default
     * value for the field.
     */
    BaseModel.attr = function (value, mutator) {
        return new Attr(this, value, mutator);
    };
    /**
     * Create a string attribute.
     */
    BaseModel.string = function (value, mutator) {
        return new String$1(this, value, mutator);
    };
    /**
     * Create a number attribute.
     */
    BaseModel.number = function (value, mutator) {
        return new Number(this, value, mutator);
    };
    /**
     * Create a boolean attribute.
     */
    BaseModel.boolean = function (value, mutator) {
        return new Boolean(this, value, mutator);
    };
    /**
     * Create an increment attribute. The field with this attribute will
     * automatically increment its value when creating a new record.
     */
    BaseModel.increment = function () {
        return new Increment(this);
    };
    /**
     * Create a has one relationship.
     */
    BaseModel.hasOne = function (related, foreignKey, localKey) {
        return new HasOne(this, related, foreignKey, this.localKey(localKey));
    };
    /**
     * Create a belongs to relationship.
     */
    BaseModel.belongsTo = function (parent, foreignKey, ownerKey) {
        return new BelongsTo(this, parent, foreignKey, this.relation(parent).localKey(ownerKey));
    };
    /**
     * Create a has many relationship.
     */
    BaseModel.hasMany = function (related, foreignKey, localKey) {
        return new HasMany(this, related, foreignKey, this.localKey(localKey));
    };
    /**
     * Create a has many by relationship.
     */
    BaseModel.hasManyBy = function (parent, foreignKey, ownerKey) {
        return new HasManyBy(this, parent, foreignKey, this.relation(parent).localKey(ownerKey));
    };
    /**
     * Create a has many through relationship.
     */
    BaseModel.hasManyThrough = function (related, through, firstKey, secondKey, localKey, secondLocalKey) {
        return new HasManyThrough(this, related, through, firstKey, secondKey, this.localKey(localKey), this.relation(through).localKey(secondLocalKey));
    };
    /**
     * The belongs to many relationship.
     */
    BaseModel.belongsToMany = function (related, pivot, foreignPivotKey, relatedPivotKey, parentKey, relatedKey) {
        return new BelongsToMany(this, related, pivot, foreignPivotKey, relatedPivotKey, this.localKey(parentKey), this.relation(related).localKey(relatedKey));
    };
    /**
     * Create a morph to relationship.
     */
    BaseModel.morphTo = function (id, type) {
        return new MorphTo(this, id, type);
    };
    /**
     * Create a morph one relationship.
     */
    BaseModel.morphOne = function (related, id, type, localKey) {
        return new MorphOne(this, related, id, type, this.localKey(localKey));
    };
    /**
     * Create a morph many relationship.
     */
    BaseModel.morphMany = function (related, id, type, localKey) {
        return new MorphMany(this, related, id, type, this.localKey(localKey));
    };
    /**
     * Create a morph to many relationship.
     */
    BaseModel.morphToMany = function (related, pivot, relatedId, id, type, parentKey, relatedKey) {
        return new MorphToMany(this, related, pivot, relatedId, id, type, this.localKey(parentKey), this.relation(related).localKey(relatedKey));
    };
    /**
     * Create a morphed by many relationship.
     */
    BaseModel.morphedByMany = function (related, pivot, relatedId, id, type, parentKey, relatedKey) {
        return new MorphedByMany(this, related, pivot, relatedId, id, type, this.localKey(parentKey), this.relation(related).localKey(relatedKey));
    };
    /**
     * Mutators to mutate matching fields when instantiating the model.
     */
    BaseModel.mutators = function () {
        return {};
    };
    /**
     * Get connection instance out of the container.
     */
    BaseModel.conn = function () {
        return Container.connection(this.connection);
    };
    /**
     * Get Vuex Store instance out of connection.
     */
    BaseModel.store = function () {
        return this.conn().store();
    };
    /**
     * Get module namespaced path for the model.
     */
    BaseModel.namespace = function (method) {
        return this.connection + "/" + this.entity + "/" + method;
    };
    /**
     * Dispatch an action.
     */
    BaseModel.dispatch = function (method, payload) {
        return this.store().dispatch(this.namespace(method), payload);
    };
    /**
     * Call getetrs.
     */
    BaseModel.getters = function (method) {
        return this.store().getters[this.namespace(method)];
    };
    /**
     * Get the value of the primary key.
     */
    BaseModel.id = function (record) {
        var key = this.primaryKey;
        if (typeof key === 'string') {
            return record[key];
        }
        return key.map(function (k) { return record[k]; }).join('_');
    };
    /**
     * Get local key to pass to the attributes.
     */
    BaseModel.localKey = function (key) {
        if (key) {
            return key;
        }
        return typeof this.primaryKey === 'string' ? this.primaryKey : 'id';
    };
    /**
     * Get a model from the container.
     */
    BaseModel.relation = function (model) {
        if (typeof model !== 'string') {
            return model;
        }
        return this.conn().model(model);
    };
    /**
     * Get the attribute class for the given attribute name.
     */
    BaseModel.getAttributeClass = function (name) {
        switch (name) {
            case 'increment': return Increment;
            default:
                throw Error("The attribute name \"" + name + "\" doesn't exists.");
        }
    };
    /**
     * Get all of the fields that matches the given attribute name.
     */
    BaseModel.getFields = function (name) {
        var attr = this.getAttributeClass(name);
        var fields = this.fields();
        return Object.keys(fields).reduce(function (newFields, key) {
            var field = fields[key];
            if (field instanceof attr) {
                newFields[key] = field;
            }
            return newFields;
        }, {});
    };
    /**
     * Get all `increment` fields from the schema.
     */
    BaseModel.getIncrementFields = function () {
        return this.getFields('increment');
    };
    /**
     * Check if fields contains the `increment` field type.
     */
    BaseModel.hasIncrementFields = function () {
        return Object.keys(this.getIncrementFields()).length > 0;
    };
    /**
     * Get all `belongsToMany` fields from the schema.
     */
    BaseModel.pivotFields = function () {
        var fields = [];
        Utils.forOwn(this.fields(), function (field, key) {
            if (field instanceof BelongsToMany || field instanceof MorphToMany || field instanceof MorphedByMany) {
                fields.push((_a = {}, _a[key] = field, _a));
            }
            var _a;
        });
        return fields;
    };
    /**
     * Check if fields contains the `belongsToMany` field type.
     */
    BaseModel.hasPivotFields = function () {
        return this.pivotFields().length > 0;
    };
    /**
     * Remove any fields not defined in the model schema. This method
     * also fixes any incorrect values as well.
     */
    BaseModel.fix = function (data, keep, fields) {
        var _this = this;
        if (keep === void 0) { keep = ['$id']; }
        var _fields = fields || this.fields();
        return Object.keys(data).reduce(function (record, key) {
            var value = data[key];
            var field = _fields[key];
            if (keep.includes(key)) {
                record[key] = value;
                return record;
            }
            if (!field) {
                return record;
            }
            if (field instanceof Attribute) {
                record[key] = field.fill(value);
                return record;
            }
            record[key] = _this.fix(value, [], field);
            return record;
        }, {});
    };
    /**
     * Fix multiple records.
     */
    BaseModel.fixMany = function (data, keep) {
        var _this = this;
        return Object.keys(data).reduce(function (records, id) {
            records[id] = _this.fix(data[id], keep);
            return records;
        }, {});
    };
    /**
     * Fill any missing fields in the given data with the default
     * value defined in the model schema.
     */
    BaseModel.hydrate = function (data, keep, fields) {
        var _this = this;
        if (keep === void 0) { keep = ['$id']; }
        var _fields = fields || this.fields();
        var record = Object.keys(_fields).reduce(function (record, key) {
            var field = _fields[key];
            var value = data[key];
            if (field instanceof Attribute) {
                record[key] = field.fill(value);
                return record;
            }
            record[key] = _this.hydrate(value || [], [], field);
            return record;
        }, {});
        return Object.keys(data).reduce(function (record, key) {
            if (keep.includes(key) && data[key] !== undefined) {
                record[key] = data[key];
            }
            return record;
        }, record);
    };
    /**
     * Fill multiple records.
     */
    BaseModel.hydrateMany = function (data, keep) {
        var _this = this;
        return Object.keys(data).reduce(function (records, id) {
            records[id] = _this.hydrate(data[id], keep);
            return records;
        }, {});
    };
    /**
     * Fill the given obejct with the given record. If no record were passed,
     * or if the record has any missing fields, each value of the fields will
     * be filled with its default value defined at model fields definition.
     */
    BaseModel.fill = function (self, record, fields) {
        var _this = this;
        if (self === void 0) { self = {}; }
        if (record === void 0) { record = {}; }
        var theFields = fields || this.fields();
        return Object.keys(theFields).reduce(function (target, key) {
            var field = theFields[key];
            var value = record[key];
            if (field instanceof Attribute) {
                target[key] = field.make(value, record, key);
                return target;
            }
            target[key] = _this.fill(target[key], value, field);
            return target;
        }, self);
    };
    /**
     * Get the static class of this model.
     */
    BaseModel.prototype.$self = function () {
        return this.constructor;
    };
    /**
     * The definition of the fields of the model and its relations.
     */
    BaseModel.prototype.$fields = function () {
        return this.$self().fields();
    };
    /**
     * Get the value of the primary key.
     */
    BaseModel.prototype.$id = function () {
        return this.$self().id(this);
    };
    /**
     * Get the connection instance out of the container.
     */
    BaseModel.prototype.$conn = function () {
        return this.$self().conn();
    };
    /**
     * Get Vuex Store insatnce out of connection.
     */
    BaseModel.prototype.$store = function () {
        return this.$self().store();
    };
    /**
     * Get module namespaced path for the model.
     */
    BaseModel.prototype.$namespace = function (method) {
        return this.$self().namespace(method);
    };
    /**
     * Dispatch an action.
     */
    BaseModel.prototype.$dispatch = function (method, payload) {
        return this.$self().dispatch(method, payload);
    };
    /**
     * Call getetrs.
     */
    BaseModel.prototype.$getters = function (method) {
        return this.$self().getters(method);
    };
    /**
     * Fill the model instance with the given record. If no record were passed,
     * or if the record has any missing fields, each value of the fields will
     * be filled with its default value defined at model fields definition.
     */
    BaseModel.prototype.$fill = function (record) {
        this.$self().fill(this, record);
    };
    /**
     * Serialize field values into json.
     */
    BaseModel.prototype.$toJson = function () {
        return this.$buildJson(this.$self().fields(), this);
    };
    /**
     * Build Json data.
     */
    BaseModel.prototype.$buildJson = function (data, field) {
        return Utils.mapValues(data, function (attr, key) {
            if (!field[key]) {
                return field[key];
            }
            if (!Contract.isAttribute(attr)) {
                return field.$buildJson(attr, field[key]);
            }
            if (attr instanceof HasOne || attr instanceof BelongsTo) {
                return field[key].$toJson();
            }
            if (attr instanceof HasMany) {
                return field[key].map(function (BaseModel) { return BaseModel.$toJson(); });
            }
            return field[key];
        });
    };
    /**
     * The primary key to be used for the model.
     */
    BaseModel.primaryKey = 'id';
    return BaseModel;
}());

var __assign$9 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Http = /** @class */ (function () {
    function Http() {
    }
    Http.request = function (url, _query, _method, _body, _headers, options) {
        if (_body === void 0) { _body = null; }
        if (_headers === void 0) { _headers = {}; }
        if (options === void 0) { options = {}; }
        var _options = __assign$9({}, this.defaultOptions, options);
        return fetch(url, _options)
            .then(function (response) { return response.json(); }); // parses response to JSON
    };
    Http.get = function (url, params, headers, options) {
        if (params === void 0) { params = {}; }
        if (headers === void 0) { headers = {}; }
        if (options === void 0) { options = {}; }
        return this.request(url, params, 'GET', null, headers, options);
    };
    Http.post = function (url, payload, headers, options) {
        if (payload === void 0) { payload = null; }
        if (headers === void 0) { headers = {}; }
        if (options === void 0) { options = {}; }
        return this.request(url, {}, 'POST', payload, headers, options);
    };
    // Default options are marked with *
    Http.defaultOptions = {
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        },
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer' // *client, no-referrer
    };
    return Http;
}());

var __extends$18 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Model = /** @class */ (function (_super) {
    __extends$18(Model, _super);
    function Model() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Parse data after api response before save on the vuex store
     */
    Model.onSuccessFetch = function (data) {
        return Promise.resolve(data);
    };
    /**
     * Wrap query getter
     */
    Model.query = function () {
        return this.getters('query')();
    };
    /**
     * Wrap count method
     */
    Model.count = function () {
        return this.query().all().length;
    };
    /**
     * Fetch data from api server if the store is empty
     */
    Model.fetch = function () {
        var data = this.query().get();
        if (data.length)
            return Promise.resolve(data);
        return this.refresh();
    };
    /**
     * Fetch data from api and store in vuex
     */
    Model.refresh = function () {
        var _this = this;
        var baseUrl = ModuleOptions.resources.baseUrl;
        var url = baseUrl + "/" + this.name.toLowerCase() + ".json";
        return Http.get(url).then(function (data) {
            _this.dispatch('insertOrUpdate', { data: data });
        }, function (err) {
            console.log(err);
        });
    };
    return Model;
}(BaseModel));

var rootGetters = {
    /**
     * Create a new Query instance.
     */
    query: function (state) { return function (entity, wrap) {
        return Query.query(state, entity, wrap);
    }; },
    /**
     * Get all data of given entity.
     */
    all: function (state) { return function (entity, wrap) {
        return Query.all(state, entity, wrap);
    }; },
    /**
     * Find a data of the given entity by given id.
     */
    find: function (state) { return function (entity, id, wrap) {
        return Query.find(state, entity, id, wrap);
    }; }
};

var subGetters = {
    /**
     * Create a new Query instance.
     */
    query: function (state, _getters, _rootState, rootGetters) { return function (wrap) {
        return rootGetters[state.$connection + "/query"](state.$name, wrap);
    }; },
    /**
     * Get all data of given entity.
     */
    all: function (state, _getters, _rootState, rootGetters) { return function (wrap) {
        return rootGetters[state.$connection + "/all"](state.$name, wrap);
    }; },
    /**
     * Find a data of the given entity by given id.
     */
    find: function (state, _getters, _rootState, rootGetters) { return function (id, wrap) {
        return rootGetters[state.$connection + "/find"](state.$name, id, wrap);
    }; }
};

var rootActions = {
    /**
     * Save new data to the state. It will remove all existing data in the
     * state. If you want to keep existing data while saving new data,
     * use `insert` instead.
     */
    create: function (context, _a) {
        var entity = _a.entity, data = _a.data, create = _a.create, insert = _a.insert, update = _a.update, insertOrUpdate = _a.insertOrUpdate;
        return (new Query(context.state, entity))
            .setActionContext(context)
            .create(data, { create: create, insert: insert, update: update, insertOrUpdate: insertOrUpdate });
    },
    /**
     * Insert given data to the state. Unlike `create`, this method will not
     * remove existing data within the state, but it will update the data
     * with the same primary key.
     */
    insert: function (context, _a) {
        var entity = _a.entity, data = _a.data, create = _a.create, insert = _a.insert, update = _a.update, insertOrUpdate = _a.insertOrUpdate;
        return (new Query(context.state, entity))
            .setActionContext(context)
            .insert(data, { create: create, insert: insert, update: update, insertOrUpdate: insertOrUpdate });
    },
    /**
     * Update data in the store.
     */
    update: function (context, _a) {
        var entity = _a.entity, where = _a.where, data = _a.data, create = _a.create, insert = _a.insert, update = _a.update, insertOrUpdate = _a.insertOrUpdate;
        return (new Query(context.state, entity))
            .setActionContext(context)
            .update(data, where, { create: create, insert: insert, update: update, insertOrUpdate: insertOrUpdate });
    },
    /**
     * Insert or update given data to the state. Unlike `insert`, this method
     * will not replace existing data within the state, but it will update only
     * the submitted data with the same primary key.
     */
    insertOrUpdate: function (context, _a) {
        var entity = _a.entity, data = _a.data, create = _a.create, insert = _a.insert, update = _a.update, insertOrUpdate = _a.insertOrUpdate;
        return (new Query(context.state, entity))
            .setActionContext(context)
            .insertOrUpdate(data, { create: create, insert: insert, update: update, insertOrUpdate: insertOrUpdate });
    },
    /**
     * Delete data from the store.
     */
    delete: function (context, _a) {
        var entity = _a.entity, where = _a.where;
        return (new Query(context.state, entity)).setActionContext(context).delete(where);
    },
    /**
     * Delete all data from the store.
     */
    deleteAll: function (_a, payload) {
        var commit = _a.commit;
        commit('deleteAll', payload);
    }
};

var __assign$10 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var subActions = {
    /**
     * Save new data to the state. It will remove all existing data in the
     * state. If you want to keep existing data while saving new data,
     * use `insert` instead.
     */
    create: function (_a, payload) {
        var dispatch = _a.dispatch, state = _a.state;
        return dispatch(state.$connection + "/create", __assign$10({ entity: state.$name }, payload), { root: true });
    },
    /**
     * Insert given data to the state. Unlike `create`, this method will not
     * remove existing data within the state, but it will update the data
     * with the same primary key.
     */
    insert: function (_a, payload) {
        var dispatch = _a.dispatch, state = _a.state;
        return dispatch(state.$connection + "/insert", __assign$10({ entity: state.$name }, payload), { root: true });
    },
    /**
     * Update data in the store.
     */
    update: function (_a, payload) {
        var dispatch = _a.dispatch, state = _a.state;
        var where = payload.where, data = payload.data;
        if (where === undefined || data === undefined) {
            return dispatch(state.$connection + "/update", { entity: state.$name, data: payload }, { root: true });
        }
        return dispatch(state.$connection + "/update", __assign$10({ entity: state.$name }, payload), { root: true });
    },
    /**
     * Insert or update given data to the state. Unlike `insert`, this method
     * will not replace existing data within the state, but it will update only
     * the submitted data with the same primary key.
     */
    insertOrUpdate: function (_a, payload) {
        var dispatch = _a.dispatch, state = _a.state;
        return dispatch(state.$connection + "/insertOrUpdate", __assign$10({ entity: state.$name }, payload), { root: true });
    },
    /**
     * Delete data from the store.
     */
    delete: function (_a, condition) {
        var dispatch = _a.dispatch, state = _a.state;
        var where = typeof condition === 'object' ? condition.where : condition;
        return dispatch(state.$connection + "/delete", { entity: state.$name, where: where }, { root: true });
    },
    /**
     * Delete all data from the store.
     */
    deleteAll: function (_a) {
        var dispatch = _a.dispatch, state = _a.state;
        dispatch(state.$connection + "/deleteAll", { entity: state.$name }, { root: true });
    }
};

var mutations = {
    /**
     * Save new data to the state. It will remove all existing data in the
     * state. If you want to keep existing data while saving new data,
     * use `insert` instead.
     */
    create: function (state, _a) {
        var entity = _a.entity, data = _a.data, create = _a.create, insert = _a.insert, update = _a.update, insertOrUpdate = _a.insertOrUpdate;
        Query.create(state, entity, data, { create: create, insert: insert, update: update, insertOrUpdate: insertOrUpdate });
    },
    /**
     * Commit `create` to the state.
     */
    commitCreate: function (state, _a) {
        var entity = _a.entity, data = _a.data;
        Query.commitCreate(state, entity, data);
    },
    /**
     * Insert given data to the state. Unlike `create`, this method will not
     * remove existing data within the state, but it will update the data
     * with the same primary key.
     */
    insert: function (state, _a) {
        var entity = _a.entity, data = _a.data, create = _a.create, insert = _a.insert, update = _a.update, insertOrUpdate = _a.insertOrUpdate;
        Query.insert(state, entity, data, { create: create, insert: insert, update: update, insertOrUpdate: insertOrUpdate });
    },
    /**
     * Commit `insert` to the state.
     */
    commitInsert: function (state, _a) {
        var entity = _a.entity, data = _a.data;
        Query.commitInsert(state, entity, data);
    },
    /**
     * Update data in the store.
     */
    update: function (state, _a) {
        var entity = _a.entity, data = _a.data, where = _a.where, create = _a.create, insert = _a.insert, update = _a.update, insertOrUpdate = _a.insertOrUpdate;
        Query.update(state, entity, data, where, { create: create, insert: insert, update: update, insertOrUpdate: insertOrUpdate });
    },
    /**
     * Commit `create` to the state.
     */
    commitUpdate: function (state, _a) {
        var entity = _a.entity, data = _a.data;
        Query.commitUpdate(state, entity, data);
    },
    /**
     * Insert or update given data to the state. Unlike `insert`, this method
     * will not replace existing data within the state, but it will update only
     * the submitted data with the same primary key.
     */
    insertOrUpdate: function (state, _a) {
        var entity = _a.entity, data = _a.data, create = _a.create;
        Query.insertOrUpdate(state, entity, data, create);
    },
    /**
     * Delete data from the store.
     */
    delete: function (state, _a) {
        var entity = _a.entity, where = _a.where;
        Query.delete(state, entity, where);
    },
    /**
     * Delete all data from the store.
     */
    deleteAll: function (state, payload) {
        if (payload && payload.entity) {
            Query.deleteAll(state, payload.entity);
            return;
        }
        Query.deleteAll(state);
    },
    /**
     * Commit `delete` to the state.
     */
    commitDelete: function (state, _a) {
        var entity = _a.entity, ids = _a.ids;
        Query.commitDelete(state, entity, ids);
    }
};

function use (plugin, options) {
    if (options === void 0) { options = {}; }
    var components = {
        Model: Model,
        Query: Query,
        Attribute: Attribute,
        Type: Type,
        Attr: Attr,
        Increment: Increment,
        Relation: Relation,
        HasOne: HasOne,
        BelongsTo: BelongsTo,
        HasMany: HasMany,
        HasManyBy: HasManyBy,
        BelongsToMany: BelongsToMany,
        HasManyThrough: HasManyThrough,
        MorphTo: MorphTo,
        MorphOne: MorphOne,
        MorphMany: MorphMany,
        MorphToMany: MorphToMany,
        MorphedByMany: MorphedByMany,
        rootGetters: rootGetters,
        subGetters: subGetters,
        rootActions: rootActions,
        subActions: subActions,
        mutations: mutations
    };
    plugin.install(components, options);
}

var __assign$11 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Module = /** @class */ (function () {
    function Module() {
    }
    /**
     * The default state. This state will be merged with additional
     * entity's state if it has any.
     */
    Module.state = function () {
        return {
            $connection: '',
            $name: '',
            data: {}
        };
    };
    /**
     * Create module from the given entities.
     */
    Module.create = function (namespace, modules) {
        var tree = {
            namespaced: true,
            state: { $name: namespace },
            getters: rootGetters,
            actions: rootActions,
            mutations: mutations,
            modules: {}
        };
        return this.createTree(tree, namespace, modules);
    };
    /**
     * Creates module tree to be registered under top level module
     * from the given entities.
     */
    Module.createTree = function (tree, namespace, modules) {
        var _this = this;
        Object.keys(modules).forEach(function (name) {
            var module = modules[name];
            tree.getters[name] = function (_state, getters) { return function () {
                return getters.query(name);
            }; };
            tree.modules[name] = {
                namespaced: true,
                state: __assign$11({}, (typeof module.state === 'function' ? module.state() : module.state), _this.state(), { $connection: namespace, $name: name })
            };
            tree.modules[name]['getters'] = __assign$11({}, subGetters, module.getters);
            tree.modules[name]['actions'] = __assign$11({}, subActions, module.actions);
            tree.modules[name]['mutations'] = module.mutations || {};
        });
        return tree;
    };
    return Module;
}());

var Database = /** @class */ (function () {
    function Database() {
        /**
         * The list of entities to be registered to the Vuex Store. It contains
         * models and modules with its name.
         */
        this.entities = [];
    }
    /**
     * Register a model and module to the entities list.
     */
    Database.prototype.register = function (model, module) {
        this.entities.push({
            name: model.entity,
            model: model,
            module: module
        });
    };
    /**
     * Get all modules from the entities list.
     */
    Database.prototype.modules = function () {
        return this.entities.reduce(function (modules, entity) {
            modules[entity.name] = entity.module;
            return modules;
        }, {});
    };
    /**
     * Create the Vuex Module from registered entities.
     */
    Database.prototype.createModule = function (namespace) {
        return Module.create(namespace, this.modules());
    };
    /**
     * Register a Vuex Store instance.
     */
    Database.prototype.registerStore = function (store) {
        this.store = store;
    };
    /**
     * Register namespace to the all regitsered model.
     */
    Database.prototype.registerNamespace = function (namespace) {
        this.entities.forEach(function (entity) { entity.model.connection = namespace; });
    };
    return Database;
}());

var index_cjs = {
    install: install,
    use: use,
    Database: Database,
    Model: Model,
    Query: Query,
    Attribute: Attribute,
    Type: Type,
    Attr: Attr,
    Increment: Increment,
    Relation: Relation,
    HasOne: HasOne,
    BelongsTo: BelongsTo,
    HasMany: HasMany,
    HasManyBy: HasManyBy,
    BelongsToMany: BelongsToMany,
    HasManyThrough: HasManyThrough,
    MorphTo: MorphTo,
    MorphOne: MorphOne,
    MorphMany: MorphMany,
    MorphToMany: MorphToMany,
    MorphedByMany: MorphedByMany,
    rootGetters: rootGetters,
    subGetters: subGetters,
    rootActions: rootActions,
    subActions: subActions,
    mutations: mutations
};

module.exports = index_cjs;
