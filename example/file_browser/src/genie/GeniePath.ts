import {GenieClass, GenieFunction, GenieKey, GenieProperty, GenieObject, ExampleParse} from "reactgenie-dsl"
import Path from "path"
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

@GenieClass("A path")
export class GeniePath extends GenieObject {
    @GenieKey
    @GenieProperty("Absolute path")
    absoluteString: string;

    @GenieProperty("Current path")
    static currentPath: GeniePath;

    constructor({absoluteString} : {absoluteString: string}) {
        super({absoluteString: absoluteString});
        var absolutePath: string = "";
        if (Path.isAbsolute(absoluteString)) {
            absolutePath = Path.normalize(absoluteString);
        } else {
            absolutePath = Path.normalize(path.resolve(GeniePath.currentPath.absoluteString, absoluteString))
        }
        this.absoluteString = absolutePath;
    }

    public setup() {
        GeniePath.currentPath = GeniePath.CreateObject({absoluteString: os.homedir()});
    }

    @GenieFunction("Relative path")
    public relativeString(): string {
        return path.relative(this.absoluteString, GeniePath.currentPath.absoluteString);
    }

    @GenieFunction("List Directory")
    public listDirectory(): GeniePath[] {
        return fs.readdirSync(this.absoluteString).map((name) => GeniePath.CreateObject({absoluteString: name}));
    }

    @GenieFunction("Change Directory")
    public changeDirectory(): GeniePath {
        GeniePath.currentPath = this;
        process.chdir(this.absoluteString);
        return this;
    }

    @GenieFunction("Get Path")
    public static GetPath({pathStr = ""}: {pathStr?: string}): GeniePath {
        return GeniePath.CreateObject({absoluteString: Path.normalize(path.resolve(GeniePath.currentPath.absoluteString, pathStr))});
    }

    public description(): {} {
        // return relative path and whether it's file or directory
        return {
            "relativePath": this.relativeString(),
            "isFile": fs.lstatSync(this.absoluteString).isFile(),
            "isDirectory": fs.lstatSync(this.absoluteString).isDirectory()
        }
    }
}

export const GeniePathExample: ExampleParse[] = [
    {
        user_utterance: "what's the current directory",
        example_parsed: "GeniePath.currentPath.absolutePath",
    },
    {
        user_utterance: "list directory",
        example_parsed: "GeniePath.currentPath.listDirectory()",
    },
    {
        user_utterance: "change directory to the first one",
        example_parsed: "GeniePath.currentPath.listDirectory()[0].changeDirectory()",
    },
    {
        user_utterance: "what's in the project folder",
        example_parsed: 'GeniePath.GetPath(pathStr: "project").listDirectory()',
    }
]