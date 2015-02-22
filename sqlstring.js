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
      where: []
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
    var whereFragments = [];
    requirements.forEach(function(requirement){
      for (var attr in requirement) {
        var value = requirement[attr];
        if (attr === 'or') {
          if (!isArray(value)) {
            throw new Error('Or operator requires an array of options');
          }
          var whereFragment = "(" + buildWhereCriteria(value, 'OR') + ")";
          whereFragments.push(whereFragment);
        } else {
          var whereFragment = "";
          whereFragment += escapeAttributes(attr);
          whereFragment += " ";
          if (value instanceof SqlString) {
            whereFragment += "IN";
            whereFragment += " ";
            whereFragment += "(";
            whereFragment += value;
            whereFragment += ")";
          } else if (isArray(value)) {
            whereFragment += "IN";
            whereFragment += " ";
            whereFragment += "(";
            whereFragment += escapeValues(value);
            whereFragment += ")";
          } else if (isBoolean(value)) {
            whereFragment += "=";
            whereFragment += " ";
            whereFragment += value;
          } else {
            whereFragment += "=";
            whereFragment += " ";
            whereFragment += escapeValues(value);
          }
          whereFragments.push(whereFragment);
        }
      }
    });
    return whereFragments.join(" " + operator + " ");
  };

  var buildSetFragment = function (requirements) {
    var sql = "SET";
    sql += " ";
    var setFragments = [];
    requirements.forEach(function(requirement){
      for (var attr in requirement) {
        var value = requirement[attr];
        var setFragment = "";
        setFragment += escapeAttributes(attr);
        setFragment += " ";
        setFragment += "=";
        setFragment += " ";
        setFragment += escapeValues(value);
        setFragments.push(setFragment);
      }
    });
    sql += setFragments.join(", ");
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
    var setCriteria = this._fragment.set;
    for (var attr in requirements) {
      var requirement = {};
      requirement[attr] = requirements[attr];
      setCriteria.push(requirement);
    }
    return this;
  };

  SqlString.prototype.where = function (requirements) {
    var whereCriteria = this._fragment.where;
    for (var attr in requirements) {
      var requirement = {};
      requirement[attr] = requirements[attr];
      whereCriteria.push(requirement);
    }
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
    var sql = "";
    if (this.type === QueryTypes.SELECT) {
      sql += "SELECT";
      sql += " ";
      sql += escapeAttributes(fragment.select);
      sql += " ";
      sql += "FROM";
      sql += " ";
      sql += escapeAttributes(fragment.from);
      if (fragment.where.length) {
        sql += " ";
        sql += buildWhereFragment(fragment.where);
      }
    } else if (this.type === QueryTypes.INSERT) {
      sql += "INSERT";
      sql += " ";
      sql += "INTO";
      sql += " ";
      sql += escapeAttributes(fragment.into);
      sql += " ";
      sql += buildSetFragment(fragment.set);
    } else if (this.type === QueryTypes.UPDATE) {
      sql += "UPDATE";
      sql += " ";
      sql += escapeAttributes(fragment.update);
      sql += " ";
      sql += buildSetFragment(fragment.set);
      if (fragment.where.length) {
        sql += " ";
        sql += buildWhereFragment(fragment.where);
      }
    } else if (this.type === QueryTypes.DELETE) {
      sql += "DELETE";
      sql += " ";
      sql += "FROM";
      sql += " ";
      sql += escapeAttributes(fragment.from);
      sql += " ";
      sql += buildWhereFragment(fragment.where);
    }

    return sql;
  };

}).call(this);
