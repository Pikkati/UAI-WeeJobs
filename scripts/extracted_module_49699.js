__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  let _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]).default;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  let _classCallCheck2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  let _createClass2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));
  let _classPrivateFieldLooseBase2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[3]));
  let _classPrivateFieldLooseKey2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[4]));
  function castToNumber(value) {
    return value ? Number(value) : 0;
  }
  let _x = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("x");
  let _y = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("y");
  let _width = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("width");
  let _height = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("height");
  let DOMRectReadOnly = exports.default = /*#__PURE__*/function () {
    function DOMRectReadOnly(x, y, width, height) {
      (0, _classCallCheck2.default)(this, DOMRectReadOnly);
      Object.defineProperty(this, _x, {
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, _y, {
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, _width, {
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, _height, {
        writable: true,
        value: undefined
      });
      this.__setInternalX(x);
      this.__setInternalY(y);
      this.__setInternalWidth(width);
      this.__setInternalHeight(height);
    }
    return (0, _createClass2.default)(DOMRectReadOnly, [{
      key: "x",
      get: function get() {
        return (0, _classPrivateFieldLooseBase2.default)(this, _x)[_x];
      }
    }, {
      key: "y",
      get: function get() {
        return (0, _classPrivateFieldLooseBase2.default)(this, _y)[_y];
      }
    }, {
      key: "width",
      get: function get() {
        return (0, _classPrivateFieldLooseBase2.default)(this, _width)[_width];
      }
    }, {
      key: "height",
      get: function get() {
        return (0, _classPrivateFieldLooseBase2.default)(this, _height)[_height];
      }
    }, {
      key: "top",
      get: function get() {
        let height = (0, _classPrivateFieldLooseBase2.default)(this, _height)[_height];
        let y = (0, _classPrivateFieldLooseBase2.default)(this, _y)[_y];
        if (height < 0) {
          return y + height;
        }
        return y;
      }
    }, {
      key: "right",
      get: function get() {
        let width = (0, _classPrivateFieldLooseBase2.default)(this, _width)[_width];
        let x = (0, _classPrivateFieldLooseBase2.default)(this, _x)[_x];
        if (width < 0) {
          return x;
        }
        return x + width;
      }
    }, {
      key: "bottom",
      get: function get() {
        let height = (0, _classPrivateFieldLooseBase2.default)(this, _height)[_height];
        let y = (0, _classPrivateFieldLooseBase2.default)(this, _y)[_y];
        if (height < 0) {
          return y;
        }
        return y + height;
      }
    }, {
      key: "left",
      get: function get() {
        let width = (0, _classPrivateFieldLooseBase2.default)(this, _width)[_width];
        let x = (0, _classPrivateFieldLooseBase2.default)(this, _x)[_x];
        if (width < 0) {
          return x + width;
        }
        return x;
      }
    }, {
      key: "toJSON",
      value: function toJSON() {
        let x = this.x,
          y = this.y,
          width = this.width,
          height = this.height,
          top = this.top,
          left = this.left,
          bottom = this.bottom,
          right = this.right;
        return {
          x: x,
          y: y,
          width: width,
          height: height,
          top: top,
          left: left,
          bottom: bottom,
          right: right
        };
      }
    }, {
      key: "__getInternalX",
      value: function __getInternalX() {
        return (0, _classPrivateFieldLooseBase2.default)(this, _x)[_x];
      }
    }, {
      key: "__getInternalY",
      value: function __getInternalY() {
        return (0, _classPrivateFieldLooseBase2.default)(this, _y)[_y];
      }
    }, {
      key: "__getInternalWidth",
      value: function __getInternalWidth() {
        return (0, _classPrivateFieldLooseBase2.default)(this, _width)[_width];
      }
    }, {
      key: "__getInternalHeight",
      value: function __getInternalHeight() {
        return (0, _classPrivateFieldLooseBase2.default)(this, _height)[_height];
      }
    }, {
      key: "__setInternalX",
      value: function __setInternalX(x) {
        (0, _classPrivateFieldLooseBase2.default)(this, _x)[_x] = castToNumber(x);
      }
    }, {
      key: "__setInternalY",
      value: function __setInternalY(y) {
        (0, _classPrivateFieldLooseBase2.default)(this, _y)[_y] = castToNumber(y);
      }
    }, {
      key: "__setInternalWidth",
      value: function __setInternalWidth(width) {
        (0, _classPrivateFieldLooseBase2.default)(this, _width)[_width] = castToNumber(width);
      }
    }, {
      key: "__setInternalHeight",
      value: function __setInternalHeight(height) {
        (0, _classPrivateFieldLooseBase2.default)(this, _height)[_height] = castToNumber(height);
      }
    }], [{
      key: "fromRect",
      value: function fromRect(rect) {
        if (!rect) {
          return new DOMRectReadOnly();
        }
        return new DOMRectReadOnly(rect.x, rect.y, rect.width, rect.height);
      }
    }]);
  }();
  (0, _$$_REQUIRE(_dependencyMap[5]).setPlatformObject)(DOMRectReadOnly, {
    clone: function clone(rect) {
      return new DOMRectReadOnly(rect.x, rect.y, rect.width, rect.height);
    }
  });
},24,[4,12,13,25,26,27]);