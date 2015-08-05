/*eslint "no-inner-declarations": 0*/
if (!'URLSearchParams' in window) {
  function URLSearchParams(search) {
    this.__params = {};
    if (typeof search === 'string') {
      search.split('&').forEach(function (param) {
        param = param.split('=');
        var name = param.shift();
        param.map(function (value) {
          this.append(name, value);
        }.bind(this));
      }.bind(this));
    }
  }
  URLSearchParams.prototype = {
    set: function (name, value) {
      this.__params[name] = [
        value
      ];
    },
    append: function (name, value) {
      this.has(name) ? this.__params[name].push(value) : this.set(name, value);
    },
    get: function (name) {
      return this.has(name) ? this.__params[name][0] : null;
    },
    getAll: function (name) {
      return this.__params[name] || [];
    },
    has: function (name) {
      return this.__params.hasOwnProperty(name);
    },
    delete: function (name) {
      delete this.__params[name];
    },
    toString: function () {
      return Object.keys(this.__params).reduce(function (params, param) {
        return params.concat(this.getAll(param).reduce(function (carry, item) {
          carry.push(encodeURI(param) + '=' + encodeURI(item));
          return carry;
        }, []));
      }.bind(this), []).join('&');
    },
    params: {
      enumerable: false,
      writable: false,
      configurable: false
    }
  };
}
