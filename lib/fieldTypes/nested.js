/*!
 * Module dependencies.
 */

var _ = require('underscore'),
	keystone = require('../../'),
	util = require('util'),
	utils = require('keystone-utils'),
	super_ = require('../field');

/**
 * Nested FieldType Constructor
 * @extends Field
 * @api public
 */
function nested(list, path, options) {
	if(options.filds && !options.filds.length){
		console.error('\nError: Invalid Configuration\n\n' +
			'Fields property is required but not initial, and has no default or generated value.\n');
		return process.exit(1);
	}
	this._nativeType = [];
	this._underscoreMethods = [];
	this.filds = _.map(options.filds, function(fild){
		var _fild = new fild.type(list, path, fild);
		_fild.render = function(type, item, locals){
			return _fild.__proto__.render.call(_fild, type, item, locals);
		};
		return _fild;
	});
	nested.super_.call(this, list, path, options);
}

/*!
 * Inherit from Field
 */

util.inherits(nested, super_);



/**
 * Updates the value for this field in the item from a data object.
 * Only updates the value if it has changed.
 * Treats an empty string as a null value.
 *
 * @api public
 */

nested.prototype.updateItem = function(item, data) {

	if (!(this.path in data)) {
		return;
	}

	if (item.populated(this.path)) {
		throw new Error('fieldTypes.relationship.updateItem() Error - You cannot update populated relationships.');
	}

	if (this.many) {

		var arr = item.get(this.path),
			_old = arr.map(function(i) { return String(i); }),
			_new = data[this.path];

		if (!utils.isArray(_new)) {
			_new = String(_new || '').split(',');
		}

		_new = _.compact(_new);

		// remove ids
		_.difference(_old, _new).forEach(function(val) {
			arr.pull(val);
		});
		// add new ids
		_.difference(_new, _old).forEach(function(val) {
			arr.push(val);
		});

	} else {
		if (data[this.path]) {
			if (data[this.path] !== item.get(this.path)) {
				item.set(this.path, data[this.path]);
			}
		} else if (item.get(this.path)) {
			item.set(this.path, null);
		}
	}

};

nested.prototype.render = function(type, item, locals){
	console.log(item);
	locals.filds = _.map(this.filds, function(fild){
		return fild.render(type, item, locals);
	});
	return nested.super_.prototype.render.call(this, type, item, locals);
};

/*!
 * Export class
 */

exports = module.exports = nested;
