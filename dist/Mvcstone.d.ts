import { Score } from "sandstone";
/**
 * Include the function pointed by the decorator in the the actual Minecraft function implementation.
 *
 * @param {string} dir the mcfunction file path
 * @returns `Function` function stacked into MCFunction blocks in the sandstone library.
 */
export declare function isMCFunction(dir: string): (target: any, property: string, descriptor: PropertyDescriptor) => void;
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
export declare function Controller(): (target: any) => void;
export declare function FunctionPath(path: string): (target: any) => void;
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
export declare function isLoopTick(dir: string): (target: any, property: string, descriptor: PropertyDescriptor) => void;
export declare function isLoopBy(dir: string, tick: any): (target: any, property: string, descriptor: PropertyDescriptor) => void;
export declare type ScoreboardCondition = "<" | "<=" | ">" | "==" | ">=" | "><" | "!=";
export declare type ScoreboardOperator = "+=" | "-=" | "/=" | "%=" | "*=";
/**
 * `MVCScoreboard`
 *
 * protects objective values and shorten operation functions
 */
export declare class MVCScoreboard {
    #private;
    constructor(scoreboardName: string, criteria: any);
    /**
     * returns scoreboard's name.
     * @returns scoreboardName
     */
    getName(): string;
    /**
     * returns Selected Scoreboard which is already implmented in Sandstone,
     * returns Scoreboard(selector)
     * so that you can just start using sandstone's built-in scoreboard methods by this operation.
     * @param selector minecraft Selector. for example, '@s'
     * @returns {Score<string | undefined>} Scoreboard
     */
    getSelector(selector: string): any;
    /**
     * Sets the scoreboard absolute value
     * automatically sets pseudo-user named `#value` which value is same as it.
     * @param value
     * @returns nothing - sets scoreboard value as absolute.
     */
    setAbsolute(value: number): void;
    /**
     * minecraft scoreboard objective selector set value command
     * usage : `this.set('@s', 1)` means `scoreboard players set @s scoreboardname 1`
     * @param selector minecraft Selector. for example, '@s'
     * @param value value to set
     */
    set(selector: string, value: number): void;
    /**
     * minecraft scoreboard objective selector add value command
     * usage : `this.add('@s', 1)` means `scoreboard players add @s scoreboardname 1`
     * @param selector minecraft Selector. for example, '@s'
     * @param value value to add
     */
    add(selector: string, value: any): void;
    /**
     * minecraft scoreboard objective selector remove value command
     * usage : `this.add('@s', 1)` means `scoreboard players remove @s scoreboardname 1`
     * @param selector minecraft Selector. for example, '@s'
     * @param value value to remove
     */
    remove(selector: string, value: any): void;
    /**
     * sets Selector's scoreboard value from another's scoreboard value.
     * usage : `this.setFrom('@s', another.getSelector('@s'))` means `scoreboard players operation @s scoreboard = @s anotherscoreboard`
     * @param selector minecraft Selector. for example, '@s'
     * @param otherScoreboardSelector another MVCScoreboard getSelector Method
     */
    setFrom(selector: string, otherScoreboardSelector: Score<string | undefined>): void;
    /**
     * adds another's scoreboard value to Selector's scoreboard value.
     * usage : `this.addFrom('@s', another.getSelector('@s'))` means `scoreboard players operation @s scoreboard += @s anotherscoreboard`
     * @param selector minecraft Selector. for example, '@s'
     * @param otherScoreboardSelector another MVCScoreboard getSelector Method
     */
    addFrom(selector: string, otherScoreboardSelector: Score<string | undefined>): void;
    /**
     * returns operating statement for sandstone.
     * > usage :
     * > `this.calculate('@s', '+=', otherMVCScoreboard.getSelector)`;
     *
     * @param selector
     * @param operator
     * @param otherScoreboardSelector
     */
    calculate(selector: string, operator: ScoreboardOperator, otherScoreboardSelector: Score<string | undefined>): void;
    /**
     * returns condition for sandstone if statement
     * usage : `_.if(this.if('@s', '==', otherMVCScoreboard()), () => { ... });`
     * @param selector selector to select with this scoreboard.
     * @param {ScoreboardCondition} condition minecraft scoreboard operation conditions.
     * @param otherScoreboardSelector other MVCScoreboard.getSelector()
     */
    if(selector: string, condition: ScoreboardCondition, otherScoreboardSelector: Score<string | undefined>): import("sandstone/variables").ConditionClass;
    /**
     * you can call this function instead of writing score objective.
     * @param {string} selector - selector to select with this scoreboard.
     * @returns {object} {"score": { 'name': selector, 'objective': this Scoreboard } }
     */
    getTellraw(selector: string): any;
}
