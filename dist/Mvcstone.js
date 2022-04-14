"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVCScoreboard = exports.isLoopBy = exports.isLoopTick = exports.Controller = exports.isMCFunction = void 0;
const sandstone_1 = require("sandstone");
function isMCFunction(dir) {
    return function (target, property, descriptor) {
        let originMethod = descriptor.value;
        descriptor.value = function (...args) {
            (0, sandstone_1.MCFunction)(dir, () => {
                originMethod.apply(this, args);
            }, { onConflict: "append" });
        };
    };
}
exports.isMCFunction = isMCFunction;
function Controller() {
    return (target) => {
        console.log("runned");
        const tg = new target();
        Object.getOwnPropertyNames(Object.getPrototypeOf(tg))
            .filter(propName => (propName !== 'constructor' && typeof tg[propName] === 'function'))
            .forEach(propName => tg[propName]());
    };
}
exports.Controller = Controller;
function isLoopTick(dir) {
    /* append function to looped in file "dir"
     if you need the functions to be called in order that you was intended,
     try calling subfunctions with 'async/await'
      @isLoopFunction(dir){
        await asyncSubFunction1();
        await asyncSubFunction2();
      }
    */
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
class MVCScoreboard {
    constructor(scoreboardName, criteria) {
        this.scoreboardName = scoreboardName;
        this.criteria = criteria;
        this.scoreboard = sandstone_1.Objective.create(this.scoreboardName, this.criteria);
    }
    getSelector(selector) {
        return this.scoreboard(selector);
    }
    getTellrawScore(selector) {
        return {
            "score": {
                "name": selector,
                "objective": this.scoreboardName
            }
        };
    }
}
exports.MVCScoreboard = MVCScoreboard;
