import { MCFunction, Objective } from "sandstone";

export function isMCFunction(dir: string) {
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor
  ) {
    let originMethod = descriptor.value;
    let path = target.prototype.functionPath;
    if(path == undefined) path = "";
    descriptor.value = function (...args: any) {
      MCFunction(
        path + dir,
        () => {
          originMethod.apply(this, args);
        },
        { onConflict: "append" }
      );
    };
  };
}

export function Controller() {
  return (target: any) => {
    console.log("runned");
    const tg = new target();
    Object.getOwnPropertyNames(Object.getPrototypeOf(tg))
      .filter(propName => (propName !== 'constructor' && typeof tg[propName] === 'function'))
      .forEach(propName => tg[propName]());
  }
}

export function FunctionPath(path: string) {
  return (target: any) => {
    target.prototype.functionPath = path;
  }
}

export function isLoopTick(dir: string) {
  /* append function to looped in file "dir"
   if you need the functions to be called in order that you was intended,
   try calling subfunctions with 'async/await' 
    @isLoopFunction(dir){
      await asyncSubFunction1();
      await asyncSubFunction2();
    } 
  */
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor
  ) {
    let originMethod = descriptor.value;
    descriptor.value = function (...args: any) {
      MCFunction(
        dir,
        () => {
          originMethod.apply(this, args);
        },
        { onConflict: "append", runEachTick: true }
      );
    };
  };
}

export function isLoopBy(dir: string, tick: any) {
  /*
    same with isLoopTick but loops by "ticks" in file "dir" 
  */
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor
  ) {
    let originMethod = descriptor.value;
    descriptor.value = function (...args: any) {
      MCFunction(
        dir,
        () => {
          originMethod.apply(this, args);
        },
        { onConflict: "append", runEach: tick }
      );
    };
  };
}

export type ScoreboardCondition = '<' | '<=' | '>' | '==' | '>=' | '><' | '!=';

// below is the class that is defined newly for more intuitive scoreboard variable usage.
export class MVCScoreboard {
  #scoreboardName;
  #scoreboard;
  #criteria;
  #absolutes:number[] = [];
  constructor(scoreboardName: string, criteria: any) {
    this.#scoreboardName = scoreboardName;
    this.#criteria = criteria;
    this.#scoreboard = Objective.create(this.#scoreboardName, this.#criteria);
  }

  getName(): string {
    return this.#scoreboardName;
  }

  getSelector(selector: string): any {
    return this.#scoreboard(selector);
  }

  setAbsolute(value:number) {
    if (this.#absolutes.includes(value)) return;
    this.#scoreboard(`#${value}`).set(value);
    this.#absolutes.push(value);
  }

  set(selector:string, value:number) {
    this.#scoreboard(selector).set(value);
  }
  add(selector:string, value:any) {
    this.#scoreboard(selector).add(value);
  }

  setFrom(){

  }
  addFrom(){

  }

  if(selector: string, condition: ScoreboardCondition, otherScoreboardSelector:any) {
    switch(condition){
      case '><':
        condition = '==';
      case '==':
        this.#scoreboard(selector).equalTo(otherScoreboardSelector);
        break;
      case '<=':
        this.#scoreboard(selector).greaterOrEqualThan(otherScoreboardSelector);
        break;
      case '<':
        this.#scoreboard(selector).greaterThan(otherScoreboardSelector);
        break;
      case '>':
        this.#scoreboard(selector).lessThan(otherScoreboardSelector);
        break;
      case '>=':
        this.#scoreboard(selector).lessOrEqualThan(otherScoreboardSelector);
        break;
      case '!=':
        this.#scoreboard(selector).notEqualTo(otherScoreboardSelector);
        break;
    }
  }

  getTellraw(selector: string): any {
    return {
      "score":{
        "name": selector,
        "objective":this.#scoreboardName
      }
    }
  }
}