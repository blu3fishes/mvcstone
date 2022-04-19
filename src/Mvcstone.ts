import { MCFunction, Objective, Score } from "sandstone";

/**
 * Include the function pointed by the decorator in the the actual Minecraft function implementation.
 *
 * @param {string} dir the mcfunction file path
 * @returns `Function` function stacked into MCFunction blocks in the sandstone library.
 */
export function isMCFunction(dir: string) {
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor
  ) {
    let originMethod = descriptor.value;
    let path = target.prototype.functionPath;
    if (path == undefined) path = "";
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
export function Controller() {
  return (target: any) => {
    console.log("runned");
    const tg = new target();
    Object.getOwnPropertyNames(Object.getPrototypeOf(tg))
      .filter(
        (propName) =>
          propName !== "constructor" && typeof tg[propName] === "function"
      )
      .forEach((propName) => tg[propName]());
  };
}

export function FunctionPath(path: string) {
  return (target: any) => {
    target.prototype.functionPath = path;
  };
}

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
export function isLoopTick(dir: string) {
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

export type ScoreboardCondition = "<" | "<=" | ">" | "==" | ">=" | "><" | "!=";
export type ScoreboardOperator = "+=" | "-=" | "/=" | "%=" | "*=";

// below is the class that is defined newly for more intuitive scoreboard variable usage.
/**
 * `MVCScoreboard`
 * 
 * protects objective values and shorten operation functions
 */
export class MVCScoreboard {
  #scoreboardName;
  #scoreboard;
  #criteria;
  #absolutes: number[] = [];
  constructor(scoreboardName: string, criteria: any) {
    this.#scoreboardName = scoreboardName;
    this.#criteria = criteria;
    this.#scoreboard = Objective.create(this.#scoreboardName, this.#criteria);
  }
  /**
   * returns scoreboard's name.
   * @returns scoreboardName
   */
  getName(): string {
    return this.#scoreboardName;
  }

  /**
   * returns Selected Scoreboard which is already implmented in Sandstone,
   * returns Scoreboard(selector)
   * so that you can just start using sandstone's built-in scoreboard methods by this operation.
   * @param selector minecraft Selector. for example, '@s'
   * @returns {Score<string | undefined>} Scoreboard
   */
  getSelector(selector: string): any {
    return this.#scoreboard(selector);
  }

  /**
   * Sets the scoreboard absolute value
   * automatically sets pseudo-user named `#value` which value is same as it.
   * @param value
   * @returns nothing - sets scoreboard value as absolute.
   */
  setAbsolute(value: number) {
    if (this.#absolutes.includes(value)) return;
    MCFunction('__init__', () => {
      this.#scoreboard(`#${value}`).set(value);
    }, { onConflict: 'append' });
    this.#absolutes.push(value);
  }
  /**
   * minecraft scoreboard objective selector set value command
   * usage : `this.set('@s', 1)` means `scoreboard players set @s scoreboardname 1`
   * @param selector minecraft Selector. for example, '@s'
   * @param value value to set
   */
  set(selector: string, value: number) {
    this.#scoreboard(selector).set(value);
  }

  /**
   * minecraft scoreboard objective selector add value command
   * usage : `this.add('@s', 1)` means `scoreboard players add @s scoreboardname 1`
   * @param selector minecraft Selector. for example, '@s'
   * @param value value to add
   */
  add(selector: string, value: any) {
    this.#scoreboard(selector).add(value);
  }

  /**
   * minecraft scoreboard objective selector remove value command
   * usage : `this.add('@s', 1)` means `scoreboard players remove @s scoreboardname 1`
   * @param selector minecraft Selector. for example, '@s'
   * @param value value to remove
   */
  remove(selector: string, value: any) {
    this.#scoreboard(selector).remove(value);
  }
  /**
   * sets Selector's scoreboard value from another's scoreboard value.
   * usage : `this.setFrom('@s', another.getSelector('@s'))` means `scoreboard players operation @s scoreboard = @s anotherscoreboard`
   * @param selector minecraft Selector. for example, '@s'
   * @param otherScoreboardSelector another MVCScoreboard getSelector Method
   */
  setFrom(
    selector: string,
    otherScoreboardSelector: Score<string | undefined>
  ) {
    this.#scoreboard(selector).set(
      otherScoreboardSelector.target,
      otherScoreboardSelector.objective.name
    );
  }

  /**
   * adds another's scoreboard value to Selector's scoreboard value.
   * usage : `this.addFrom('@s', another.getSelector('@s'))` means `scoreboard players operation @s scoreboard += @s anotherscoreboard`
   * @param selector minecraft Selector. for example, '@s'
   * @param otherScoreboardSelector another MVCScoreboard getSelector Method
   */
  addFrom(
    selector: string,
    otherScoreboardSelector: Score<string | undefined>
  ) {
    this.#scoreboard(selector).add(
      otherScoreboardSelector.target,
      otherScoreboardSelector.objective.name
    );
  }
  /**
   * returns operating statement for sandstone.
   * > usage :
   * > `this.calculate('@s', '+=', otherMVCScoreboard.getSelector)`;
   * > `this.calculate('@s', '+=', 3)`
   * @param selector
   * @param operator
   * @param otherScoreboardSelector
   */
  calculate(
    selector: string,
    operator: ScoreboardOperator,
    otherScoreboardSelector: Score<string | undefined> | number
  ) {
    if (typeof otherScoreboardSelector == 'object') {
      switch (operator) {
        case "%=":
          this.#scoreboard(selector).moduloBy(
            otherScoreboardSelector.target,
            otherScoreboardSelector.objective.name
          );
          break;
        case "/=":
          this.#scoreboard(selector).dividedBy(
            otherScoreboardSelector.target,
            otherScoreboardSelector.objective.name
          );
          break;
        case "*=":
          this.#scoreboard(selector).multipliedBy(
            otherScoreboardSelector.target,
            otherScoreboardSelector.objective.name
          );
          break;
        case "+=":
          this.#scoreboard(selector).add(
            otherScoreboardSelector.target,
            otherScoreboardSelector.objective.name
          );
          break;
        case "-=":
          this.#scoreboard(selector).remove(
            otherScoreboardSelector.target,
            otherScoreboardSelector.objective.name
          );
          break;
      }
    }
    else if (typeof otherScoreboardSelector == 'number') {
      this.setAbsolute(otherScoreboardSelector);
      switch (operator) {
        case "%=":
          this.#scoreboard(selector).moduloBy(
            `#${otherScoreboardSelector}`,
            this.getName()
          );
          break;
        case "/=":
          this.#scoreboard(selector).dividedBy(
            `#${otherScoreboardSelector}`,
            this.getName()
          );
          break;
        case "*=":
          this.#scoreboard(selector).multipliedBy(
            `#${otherScoreboardSelector}`,
            this.getName()
          );
          break;
        case "+=":
          this.#scoreboard(selector).add(
            `#${otherScoreboardSelector}`,
            this.getName()
          );
          break;
        case "-=":
          this.#scoreboard(selector).remove(
            `#${otherScoreboardSelector}`,
            this.getName()
          );
          break;
      }
    }
    else {
      throw new Error('otherScoreboard value is not number or Score<>');
    }
  }
  /**
   * returns condition for sandstone if statement  
   * usage #1 : 
   * ```
   * _.if(this.if('@s', '==', otherMVCScoreboard.getSelector('@s')).run(() => { ... });
   * ```
   * usage #2 : 
   * ```
   * _.if(this.if('@s', '==', 3)).run(() => { ... });
   * ```
   * @param selector selector to select with this scoreboard.
   * @param {ScoreboardCondition} condition minecraft scoreboard operation conditions.
   * @param otherScoreboardSelector other MVCScoreboard.getSelector()
   */
  if(
    selector: string,
    condition: ScoreboardCondition,
    otherScoreboardSelector: Score<string | undefined> | number
  ) {
    if (typeof otherScoreboardSelector == 'object') {
      switch (condition) {
        case "><":
          condition = "==";
        case "==":
          return this.#scoreboard(selector).equalTo(otherScoreboardSelector);
        case "<=":
          return this.#scoreboard(selector).greaterOrEqualThan(
            otherScoreboardSelector
          );
        case "<":
          return this.#scoreboard(selector).greaterThan(otherScoreboardSelector);
        case ">":
          return this.#scoreboard(selector).lessThan(otherScoreboardSelector);
        case ">=":
          return this.#scoreboard(selector).lessOrEqualThan(
            otherScoreboardSelector
          );
        case "!=":
          return this.#scoreboard(selector).notEqualTo(otherScoreboardSelector);
      }
    }
    else if (typeof otherScoreboardSelector == 'number') {
      this.setAbsolute(otherScoreboardSelector);
      switch (condition) {
        case "><":
          condition = "==";
        case "==":
          return this.#scoreboard(selector).equalTo(this.getSelector(`#${otherScoreboardSelector}`));
        case "<=":
          return this.#scoreboard(selector).greaterOrEqualThan(
            this.getSelector(`#${otherScoreboardSelector}`)
          );
        case "<":
          return this.#scoreboard(selector).greaterThan(this.getSelector(`#${otherScoreboardSelector}`));
        case ">":
          return this.#scoreboard(selector).lessThan(this.getSelector(`#${otherScoreboardSelector}`));
        case ">=":
          return this.#scoreboard(selector).lessOrEqualThan(
            this.getSelector(`#${otherScoreboardSelector}`)
          );
        case "!=":
          return this.#scoreboard(selector).notEqualTo(this.getSelector(`#${otherScoreboardSelector}`));
      }
    }
    else {
      throw new Error('otherScoreboard value is not number or Score<>');
    }
  }

  /**
   * you can call this function instead of writing score objective.
   * @param {string} selector - selector to select with this scoreboard.
   * @returns {object} {"score": { 'name': selector, 'objective': this Scoreboard } }
   */
  getTellraw(selector: string): any {
    return {
      score: {
        name: selector,
        objective: this.#scoreboardName,
      },
    };
  }
}
