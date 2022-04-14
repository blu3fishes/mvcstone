export declare function isMCFunction(dir: string): (target: any, property: string, descriptor: PropertyDescriptor) => void;
export declare function Controller(): (target: any) => void;
export declare function isLoopTick(dir: string): (target: any, property: string, descriptor: PropertyDescriptor) => void;
export declare function isLoopBy(dir: string, tick: any): (target: any, property: string, descriptor: PropertyDescriptor) => void;
export declare class MVCScoreboard {
    scoreboardName: string;
    scoreboard: import("sandstone").ObjectiveInstance<string | undefined>;
    criteria: any;
    constructor(scoreboardName: string, criteria: any);
    getSelector(selector: string): any;
    getTellrawScore(selector: string): any;
}
