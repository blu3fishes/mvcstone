import { MCFunction, Objective } from "sandstone";

export function isMCFunction(dir: string) {
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

// below is the class that is defined newly for more intuitive scoreboard variable usage.
export class MVCScoreboard {
  scoreboardName;
  scoreboard;
  criteria;
  constructor(scoreboardName: string, criteria: any) {
    this.scoreboardName = scoreboardName;
    this.criteria = criteria;
    this.scoreboard = Objective.create(this.scoreboardName, this.criteria);
  }
  getSelector(selector: string): any {
    return this.scoreboard(selector);
  }
  getTellrawScore(selector: string): any {
    return {
      "score":{
        "name": selector,
        "objective":this.scoreboardName
      }
    }
  }
}