"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MVCScoreboard_scoreboardName, _MVCScoreboard_scoreboard, _MVCScoreboard_criteria, _MVCScoreboard_absolutes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVCScoreboard = exports.isLoopBy = exports.isLoopTick = exports.FunctionPath = exports.Controller = exports.isMCFunction = void 0;
const sandstone_1 = require("sandstone");
/**
 * Include the function pointed by the decorator in the the actual Minecraft function implementation.
 *
 * @param {string} dir the mcfunction file path
 * @returns `Function` function stacked into MCFunction blocks in the sandstone library.
 */
function isMCFunction(dir) {
    return function (target, property, descriptor) {
        let originMethod = descriptor.value;
        let path = target.prototype.functionPath;
        if (path == undefined)
            path = "";
        descriptor.value = function (...args) {
            (0, sandstone_1.MCFunction)(path + dir, () => {
                originMethod.apply(this, args);
            }, { onConflict: "append" });
        };
    };
}
exports.isMCFunction = isMCFunction;
/**
 * Declares the class as a controller.
 * > For classes declared as controllers, all methods are automatically
 * > executed at the time of type script compilation,
 * which results in `simultaneous MCFunction compilation.`
 * Within that function, **only the actual MCFunction creation command must be created.**
 *
 * example:
 * ```
 * \@Controller()
 * export class ControllerClass {
 *  \@isMCFunction('tick')
 *  method1 () { / implemented functions from service / }
 * }
 * ```
 */
function Controller() {
    return (target) => {
        console.log("runned");
        const tg = new target();
        Object.getOwnPropertyNames(Object.getPrototypeOf(tg))
            .filter((propName) => propName !== "constructor" && typeof tg[propName] === "function")
            .forEach((propName) => tg[propName]());
    };
}
exports.Controller = Controller;
function FunctionPath(path) {
    return (target) => {
        target.prototype.functionPath = path;
    };
}
exports.FunctionPath = FunctionPath;
/**
 * Include the function pointed by the decorator in the per-tick loop execution within the actual Minecraft function implementation.
 *
 * `below is not implemented`
 *  > append function to looped in file "dir"
 *  > if you need the functions to be called in order that you was intended,
 *  > try calling subfunctions with 'async/await'
 *  > ```@isLoopFunction(dir)  {
 *  >   await asyncSubFunction1();
 *  >    await asyncSubFunction2();
 *  >  }```
 * @param dir
 * @returns
 */
function isLoopTick(dir) {
    return function (target, property, descriptor) {
        let originMethod = descriptor.value;
        descriptor.value = function (...args) {
            (0, sandstone_1.MCFunction)(dir, () => {
                originMethod.apply(this, args);
            }, { onConflict: "append", runEachTick: true });
        };
    };
}
exports.isLoopTick = isLoopTick;
function isLoopBy(dir, tick) {
    /*
      same with isLoopTick but loops by "ticks" in file "dir"
    */
    return function (target, property, descriptor) {
        let originMethod = descriptor.value;
        descriptor.value = function (...args) {
            (0, sandstone_1.MCFunction)(dir, () => {
                originMethod.apply(this, args);
            }, { onConflict: "append", runEach: tick });
        };
    };
}
exports.isLoopBy = isLoopBy;
// below is the class that is defined newly for more intuitive scoreboard variable usage.
/**
 * `MVCScoreboard`
 *
 * protects objective values and shorten operation functions
 */
class MVCScoreboard {
    constructor(scoreboardName, criteria) {
        _MVCScoreboard_scoreboardName.set(this, void 0);
        _MVCScoreboard_scoreboard.set(this, void 0);
        _MVCScoreboard_criteria.set(this, void 0);
        _MVCScoreboard_absolutes.set(this, []);
        __classPrivateFieldSet(this, _MVCScoreboard_scoreboardName, scoreboardName, "f");
        __classPrivateFieldSet(this, _MVCScoreboard_criteria, criteria, "f");
        __classPrivateFieldSet(this, _MVCScoreboard_scoreboard, sandstone_1.Objective.create(__classPrivateFieldGet(this, _MVCScoreboard_scoreboardName, "f"), __classPrivateFieldGet(this, _MVCScoreboard_criteria, "f")), "f");
    }
    /**
     * returns scoreboard's name.
     * @returns scoreboardName
     */
    getName() {
        return __classPrivateFieldGet(this, _MVCScoreboard_scoreboardName, "f");
    }
    /**
     * returns Selected Scoreboard which is already implmented in Sandstone,
     * returns Scoreboard(selector)
     * so that you can just start using sandstone's built-in scoreboard methods by this operation.
     * @param selector minecraft Selector. for example, '@s'
     * @returns {Score<string | undefined>} Scoreboard
     */
    getSelector(selector) {
        return __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector);
    }
    /**
     * Sets the scoreboard absolute value
     * automatically sets pseudo-user named `#value` which value is same as it.
     * @param value
     * @returns nothing - sets scoreboard value as absolute.
     */
    setAbsolute(value) {
        if (__classPrivateFieldGet(this, _MVCScoreboard_absolutes, "f").includes(value))
            return;
        __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, `#${value}`).set(value);
        __classPrivateFieldGet(this, _MVCScoreboard_absolutes, "f").push(value);
    }
    /**
     * minecraft scoreboard objective selector set value command
     * usage : `this.set('@s', 1)` means `scoreboard players set @s scoreboardname 1`
     * @param selector minecraft Selector. for example, '@s'
     * @param value value to set
     */
    set(selector, value) {
        __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).set(value);
    }
    /**
     * minecraft scoreboard objective selector add value command
     * usage : `this.add('@s', 1)` means `scoreboard players add @s scoreboardname 1`
     * @param selector minecraft Selector. for example, '@s'
     * @param value value to add
     */
    add(selector, value) {
        __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).add(value);
    }
    /**
     * minecraft scoreboard objective selector remove value command
     * usage : `this.add('@s', 1)` means `scoreboard players remove @s scoreboardname 1`
     * @param selector minecraft Selector. for example, '@s'
     * @param value value to remove
     */
    remove(selector, value) {
        __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).remove(value);
    }
    /**
     * sets Selector's scoreboard value from another's scoreboard value.
     * usage : `this.setFrom('@s', another.getSelector('@s'))` means `scoreboard players operation @s scoreboard = @s anotherscoreboard`
     * @param selector minecraft Selector. for example, '@s'
     * @param otherScoreboardSelector another MVCScoreboard getSelector Method
     */
    setFrom(selector, otherScoreboardSelector) {
        __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).set(otherScoreboardSelector.target, otherScoreboardSelector.objective.name);
    }
    /**
     * adds another's scoreboard value to Selector's scoreboard value.
     * usage : `this.addFrom('@s', another.getSelector('@s'))` means `scoreboard players operation @s scoreboard += @s anotherscoreboard`
     * @param selector minecraft Selector. for example, '@s'
     * @param otherScoreboardSelector another MVCScoreboard getSelector Method
     */
    addFrom(selector, otherScoreboardSelector) {
        __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).add(otherScoreboardSelector.target, otherScoreboardSelector.objective.name);
    }
    /**
     * returns operating statement for sandstone.
     * > usage :
     * > `this.calculate('@s', '+=', otherMVCScoreboard.getSelector)`;
     *
     * @param selector
     * @param operator
     * @param otherScoreboardSelector
     */
    calculate(selector, operator, otherScoreboardSelector) {
        switch (operator) {
            case "%=":
                __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).moduloBy(otherScoreboardSelector.target, otherScoreboardSelector.objective.name);
                break;
            case "/=":
                __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).dividedBy(otherScoreboardSelector.target, otherScoreboardSelector.objective.name);
                break;
            case "*=":
                __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).multipliedBy(otherScoreboardSelector.target, otherScoreboardSelector.objective.name);
                break;
            case "+=":
                __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).add(otherScoreboardSelector.target, otherScoreboardSelector.objective.name);
                break;
            case "-=":
                __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).remove(otherScoreboardSelector.target, otherScoreboardSelector.objective.name);
                break;
        }
    }
    /**
     * returns condition for sandstone if statement
     * usage : `_.if(this.if('@s', '==', otherMVCScoreboard()), () => { ... });`
     * @param selector selector to select with this scoreboard.
     * @param {ScoreboardCondition} condition minecraft scoreboard operation conditions.
     * @param otherScoreboardSelector other MVCScoreboard.getSelector()
     */
    if(selector, condition, otherScoreboardSelector) {
        switch (condition) {
            case "><":
                condition = "==";
            case "==":
                return __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).equalTo(otherScoreboardSelector);
            case "<=":
                return __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).greaterOrEqualThan(otherScoreboardSelector);
            case "<":
                return __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).greaterThan(otherScoreboardSelector);
            case ">":
                return __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).lessThan(otherScoreboardSelector);
            case ">=":
                return __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).lessOrEqualThan(otherScoreboardSelector);
            case "!=":
                return __classPrivateFieldGet(this, _MVCScoreboard_scoreboard, "f").call(this, selector).notEqualTo(otherScoreboardSelector);
        }
    }
    /**
     * you can call this function instead of writing score objective.
     * @param {string} selector - selector to select with this scoreboard.
     * @returns {object} {"score": { 'name': selector, 'objective': this Scoreboard } }
     */
    getTellraw(selector) {
        return {
            score: {
                name: selector,
                objective: __classPrivateFieldGet(this, _MVCScoreboard_scoreboardName, "f"),
            },
        };
    }
}
exports.MVCScoreboard = MVCScoreboard;
_MVCScoreboard_scoreboardName = new WeakMap(), _MVCScoreboard_scoreboard = new WeakMap(), _MVCScoreboard_criteria = new WeakMap(), _MVCScoreboard_absolutes = new WeakMap();
