/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) { Object.assign(this, { width, height }); }
Rectangle.prototype.getArea = function f() { return this.width * this.height; };


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
const getJSON = (obj) => JSON.stringify(obj);


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
const fromJSON = (proto, json) => Object.setPrototypeOf(JSON.parse(json), proto);


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoEl
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

function SelectorBuilder() {
  Object.assign(this, {
    [SelectorBuilder.classes]: [], [SelectorBuilder.pseudos]: [], [SelectorBuilder.attrs]: [],
  });
}

Object.assign(SelectorBuilder, {
  element: 'el', id: 'idVal', classes: 'classes', attrs: 'attrs', pseudos: 'psClasses', pseudoEl: 'psEl',
});

Object.assign(SelectorBuilder, {
  elementsOrder: [
    SelectorBuilder.element, SelectorBuilder.id, SelectorBuilder.classes,
    SelectorBuilder.attrs, SelectorBuilder.pseudos, SelectorBuilder.pseudoEl,
  ],
});

SelectorBuilder.prototype.element = function f(value) {
  return this.setProperty(SelectorBuilder.element, value);
};

SelectorBuilder.prototype.id = function f(value) {
  return this.setProperty(SelectorBuilder.id, value);
};

SelectorBuilder.prototype.class = function f(value) {
  return this.addToList(SelectorBuilder.classes, value);
};

SelectorBuilder.prototype.attr = function f(value) {
  return this.addToList(SelectorBuilder.attrs, value);
};

SelectorBuilder.prototype.pseudoClass = function f(value) {
  return this.addToList(SelectorBuilder.pseudos, value);
};

SelectorBuilder.prototype.pseudoElement = function f(value) {
  return this.setProperty(SelectorBuilder.pseudoEl, value);
};

SelectorBuilder.prototype.setProperty = function f(property, value) {
  if (this[property]) SelectorBuilder.elementIsAlreadySet();
  this.checkOrder(property);
  this[property] = value;
  return this;
};

SelectorBuilder.prototype.addToList = function f(property, value) {
  this.checkOrder(property);
  this[property].push(value);
  return this;
};

SelectorBuilder.prototype.stringify = function f() {
  return [
    this[SelectorBuilder.element] || '',
    this[SelectorBuilder.id] ? `#${this[SelectorBuilder.id]}` : '',
    this[SelectorBuilder.classes].map((v) => `.${v}`).join(''),
    this[SelectorBuilder.attrs].map((v) => `[${v}]`).join(''),
    this[SelectorBuilder.pseudos].map((v) => `:${v}`).join(''),
    this[SelectorBuilder.pseudoEl] ? `::${this[SelectorBuilder.pseudoEl]}` : '',
  ].join('');
};

SelectorBuilder.prototype.checkOrder = function f(property) {
  const idx = SelectorBuilder.elementsOrder.indexOf(property);
  const checkArr = SelectorBuilder.elementsOrder.slice(idx + 1);
  if (!checkArr.every((p) => !(this[p] && this[p].length))) {
    SelectorBuilder.wrongOrder();
  }
};

SelectorBuilder.elementIsAlreadySet = function f() {
  throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
};

SelectorBuilder.wrongOrder = function f() {
  throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
};

function SelectorBuilderCombined(selector1, combinator, selector2) {
  Object.assign(this, { selectors: [selector1, selector2], combinator });
}

SelectorBuilderCombined.prototype.stringify = function f() {
  return this.selectors.map((v) => v.stringify()).join(` ${this.combinator} `);
};

const cssSelectorBuilder = {
  element(value) {
    return new SelectorBuilder().element(value);
  },

  id(value) {
    return new SelectorBuilder().id(value);
  },

  class(value) {
    return new SelectorBuilder().class(value);
  },

  attr(value) {
    return new SelectorBuilder().attr(value);
  },

  pseudoClass(value) {
    return new SelectorBuilder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new SelectorBuilder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new SelectorBuilderCombined(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
