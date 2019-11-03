import isEqual from 'lodash/isEqual'



export class BaseHandlers {
    /**
     * @private
     * @type {object}
     */
    _owner;

    /**
     * @public
     * @param {object} owner Handler owner
     */
    constructor (owner) {
        if (owner === null || typeof owner !== 'object') {
            throw new TypeError('Argument "owner" must be an object')
        }
        this._owner = owner;
    }
}



export class SimpleHandlers extends BaseHandlers {
    /**
     * @private
     * @type {object}
     */
    _all = {};

    /**
     * @public
     * @param {function} handler Handler function
     * @param {string|number|boolean} parameter Handler parameter
     * @return {function}
     */
    withParam(handler, parameter) {
        if (typeof handler !== 'function') {
            throw new TypeError('Argument "handler" must be a function')
        }
        if (['string', 'number', 'boolean'].indexOf(typeof parameter) === -1) {
            throw new TypeError('Argument "parameter" must be a string, number or boolean')
        }
        return this._all[parameter] || (this._all[parameter] = handler.bind(this._owner, parameter));
    }

    /**
     * @public
     * @param {string|number|boolean} [parameter] Handler parameter (optional)
     */
    remove(parameter) {
        if (parameter !== undefined) {
            if (['string', 'number', 'boolean'].indexOf(typeof parameter) === -1) {
                throw new TypeError('Argument "parameter" must be a string, number or boolean')
            }
            delete this._all[parameter]
        }
        else {
            this._all = {};
        }
    }
}



export default class ParametricHandlers extends BaseHandlers {
    /**
     * @private
     * @type {Array<object>}
     */
    _sets = [];

    /**
     * @public
     * @param {function} handler Handler function
     * @param {Array<*>} parameters Array of handler parameters
     * @return {function}
     */
    get(handler, ...parameters) {
        if (typeof handler !== 'function') {
            throw new TypeError('Argument "handler" must be a function')
        }
        if (parameters.length === 0) {
            throw new TypeError('No parameters supplied')
        }
        let set = this._sets.find(item => item.handler === handler);
        const noSet = set === undefined;
        if (noSet) {
            this._sets.push(set = {handler, params:[], binded:[]});
        }
        const index = noSet ? -1 : set.params.findIndex(
            item => item.length === parameters.length && isEqual(item, parameters)
        );
        const noIndex = index === -1;
        const binded = noIndex ? handler.bind(this._owner, ...parameters) : set.binded[index];
        if (noIndex) {
            set.params.push(parameters);
            set.binded.push(binded);
        }
        return binded;
    }

    /**
     * @public
     * @param {function} [handler] Handler function (optional)
     * @param {Array<*>} [parameters] Array of handler parameters (optional)
     */
    clear (handler, ...parameters) {
        if (handler !== undefined) {
            if (typeof handler !== 'function') {
                throw new TypeError('Argument "handler" must be a function')
            }
            let setIndex = this._sets.findIndex(item => item.handler === handler);
            if (setIndex !== -1) {
                if (parameters.length === 0) {
                    this._sets.splice(setIndex, 1);
                }
                else {
                    const set = this._sets[index];
                    const index = set.params.findIndex(
                        item => item.length === parameters.length && isEqual(item, parameters)
                    );
                    if (index !== -1) {
                        set.params.splice(index, 1);
                        set.binded.splice(index, 1);
                    }
                }
            }
        }
        else {
            if (parameters.length !== 0) {
                throw new TypeError('Should be no parameters without a handler')
            }
            this._sets.splice(0, this._sets.length);
        }
    }
}
