// Sqlstring.js 0.0.1
// (c) 2015 Jeffrey Smith

(function(){

  var SqlString = function (obj) {
    if (obj instanceof SqlString) return obj;
    if (!(this instanceof SqlString)) return new SqlString(obj);
    this._fragment = {
      select: [],
      update: [],
      from: [],
      into: [],
      set: [],
      where: [],
      orderBy: [],
      limit: null,
      offset: null
    };
  };

  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      exports = module.exports = SqlString;
    }
    exports.SqlString = SqlString;
  } else {
    this.SqlString = SqlString;
  }

  var QueryTypes = SqlString.QueryTypes = {
    SELECT: 1,
    INSERT: 2,
    UPDATE: 3,
    DELETE: 4
  };

  var extend = function (obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source){
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  var map = function (obj, iterator) {
    if (isArray(obj)) {
      return obj.map(iterator);
    } else {
      var results = [];
      for (var prop in obj) {
        results.push(iterator(obj[prop], prop));
      }
      return results;
    }
  };

  var isString = function (obj) {
    return typeof obj === "string";
  };

  var isArray = function (obj) {
    return obj instanceof Array;
  };

  var isBoolean = function (obj) {
    return typeof obj === "boolean";
  };

  var escapeAttributes = function (attrs) {
    if (isArray(attrs)) {
      return attrs.map(escapeAttributes).join(", ");
    } else if (attrs === "*") {
      return attrs;
    } else if (attrs.indexOf('.') !== -1) {
      return attrs.split(".").map(escapeAttributes).join(".");
    } else {
      return ["`", attrs, "`"].join("");
    }
  };

  var escapeValues = function (values) {
    if (isArray(values)) {
      return values.map(escapeValues).join(", ");
    } else {
      return ["'", values, "'"].join("");
    }
  };

  var buildWhereFragment = function (requirements) {
    var sql = "WHERE";
    sql += " ";
    sql += buildWhereCriteria(requirements, 'AND');
    return sql;
  };

  var buildWhereCriteria = function (requirements, operator) {
    return map(requirements, function (requirement) {
      return map(requirement, function (value, attr) {
        if (attr === 'or') {
          if (!isArray(value)) {
            throw new Error('Or operator requires an array of options');
          }
          return "(" + buildWhereCriteria(value, 'OR') + ")";
        } else {
          var whereFragment = [escapeAttributes(attr)];
          if (value instanceof SqlString) {
            whereFragment.push("IN");
            whereFragment.push("(" + value + ")");
          } else if (isArray(value)) {
            whereFragment.push("IN");
            whereFragment.push("(" + escapeValues(value) + ")");
          } else if (isBoolean(value)) {
            whereFragment.push("=");
            whereFragment.push(value);
          } else {
            whereFragment.push("=");
            whereFragment.push(escapeValues(value));
          }
          return whereFragment.join(" ");
        }
      });
    }).join(" " + operator + " ");
  };

  var buildSetFragment = function (requirements) {
    var sql = "SET";
    sql += " ";
    sql += map(requirements, function(requirement) {
      return map(requirement, function(value, attr) {
        return [escapeAttributes(attr), "=", escapeValues(value)].join(" ");
      });
    }).join(", ");
    return sql;
  };

  SqlString.prototype.select = function () {
    this.type = QueryTypes.SELECT;
    var ss = this;
    var selectCriteria = this._fragment.select;
    var args = Array.prototype.slice.call(arguments, 0);
    args.forEach(function(field){
      if (isArray(field)) {
        ss.select.apply(ss, field);
      } else {
        selectCriteria.push(field);
      }
    });
    return this;
  };

  SqlString.prototype.insert = function (requirements) {
    this.type = QueryTypes.INSERT;
    var setCriteria = this._fragment.set;
    for (var attr in requirements) {
      var requirement = {};
      requirement[attr] = requirements[attr];
      setCriteria.push(requirement);
    }
    return this;
  };

  SqlString.prototype.update = function (table) {
    this.type = QueryTypes.UPDATE;
    var ss = this;
    var updateCriteria = this._fragment.update;
    var args = Array.prototype.slice.call(arguments, 0);
    args.forEach(function(table){
      if (isArray(table)) {
        ss.update.apply(ss, table);
      } else {
        updateCriteria.push(table);
      }
    });
    return this;
  };

  SqlString.prototype.delete = function () {
    this.type = QueryTypes.DELETE;
    return this;
  };

  SqlString.prototype.from = function () {
    var ss = this;
    var fromCriteria = this._fragment.from;
    var args = Array.prototype.slice.call(arguments, 0);
    args.forEach(function(table){
      if (isArray(table)) {
        ss.from.apply(ss, table);
      } else {
        fromCriteria.push(table);
      }
    });
    return this;
  };

  SqlString.prototype.into = function () {
    var ss = this;
    var intoCriteria = this._fragment.into;
    var args = Array.prototype.slice.call(arguments, 0);
    args.forEach(function(table){
      if (isArray(table)) {
        ss.into.apply(ss, table);
      } else {
        intoCriteria.push(table);
      }
    });
    return this;
  };

  SqlString.prototype.set = function (requirements) {
    var ss = this;
    var setCriteria = this._fragment.set;
    var args = Array.prototype.slice.call(arguments, 0);
    args.forEach(function(requirements){
      if (isArray(requirements)) {
        ss.set.apply(ss, requirements);
      } else {
        for (var attr in requirements) {
          var requirement = {};
          requirement[attr] = requirements[attr];
          setCriteria.push(requirement);
        }
      }
    });
    return this;
  };

  SqlString.prototype.where = function (requirements) {
    var ss = this;
    var whereCriteria = this._fragment.where;
    var args = Array.prototype.slice.call(arguments, 0);
    args.forEach(function(requirements){
      if (isArray(requirements)) {
        ss.where.apply(ss, requirements);
      } else {
        for (var attr in requirements) {
          var requirement = {};
          requirement[attr] = requirements[attr];
          whereCriteria.push(requirement);
        }
      }
    });
    return this;
  };

  SqlString.prototype.limit = function (limit, offset) {
    this._fragment.limit = limit;
    if (offset) {
      this._fragment.offset = offset;
    }
    return this;
  };

  SqlString.prototype.offset = function (offset) {
    this._fragment.offset = offset;
    return this;
  };

  SqlString.prototype.orderBy = function (field, order) {
    this._fragment.orderBy.push({
      field: field,
      order: order || 'asc'
    });
    return this;
  };

  SqlString.prototype.validate = function () {
    var isValid = false;
    switch (this.type) {
      case QueryTypes.SELECT:
        isValid = this._fragment.select.length && this._fragment.from.length;
        break;
      case QueryTypes.INSERT:
        isValid = this._fragment.into.length && this._fragment.set.length;
        break;
      case QueryTypes.UPDATE:
        isValid = this._fragment.update.length && this._fragment.set.length;
        break;
      case QueryTypes.DELETE:
        isValid = this._fragment.from.length && this._fragment.where.length;
        break;
      default:
        isValid = false;
    }
    return isValid;
  };

  SqlString.prototype.toString = function () {
    if (!this.validate()) {
      throw new Error("Insufficient parameters");
    }

    var fragment = this._fragment;
    var sql = [];
    if (this.type === QueryTypes.SELECT) {
      sql.push("SELECT");
      sql.push(escapeAttributes(fragment.select));
      sql.push("FROM");
      sql.push(escapeAttributes(fragment.from));
      if (fragment.where.length) {
        sql.push(buildWhereFragment(fragment.where));
      }
      if (fragment.orderBy.length) {
        sql.push("ORDER BY");
        sql.push(fragment.orderBy.map(function(orderBy){
          return [escapeAttributes(orderBy.field), orderBy.order.toUpperCase()].join(" ");
        }).join(", "));
      }
      if (fragment.limit) {
        sql.push("LIMIT");
        sql.push(fragment.limit);
        if (fragment.offset) {
          sql.push("OFFSET");
          sql.push(fragment.offset);
        }
      }
    } else if (this.type === QueryTypes.INSERT) {
      sql.push("INSERT");
      sql.push("INTO");
      sql.push(escapeAttributes(fragment.into));
      sql.push(buildSetFragment(fragment.set));
    } else if (this.type === QueryTypes.UPDATE) {
      sql.push("UPDATE");
      sql.push(escapeAttributes(fragment.update));
      sql.push(buildSetFragment(fragment.set));
      if (fragment.where.length) {
        sql.push(buildWhereFragment(fragment.where));
      }
    } else if (this.type === QueryTypes.DELETE) {
      sql.push("DELETE");
      sql.push("FROM");
      sql.push(escapeAttributes(fragment.from));
      sql.push(buildWhereFragment(fragment.where));
    }

    return sql.join(" ");
  };

}).call(this);
