import * as fs from "fs";
import * as path from "path";
import { CommandError, CommandOption } from "../../../../Command";
import GlobalOptions from "../../../../GlobalOptions";
import commands from "../../commands";
import { BaseProjectCommand } from "./base-project-command";
import { Logger } from "../../../../cli";

interface CommandArgs {
  options: Options;
}

interface Options extends GlobalOptions {
  newName: string;
  oldName: string;
}

class SpfxComponentRenameCommand extends BaseProjectCommand {
  public static ERROR_NO_PROJECT_ROOT_FOLDER: number = 1;

  public get name(): string {
    return commands.COMPONENT_RENAME;
  }

  public get description(): string {
    return "Renames SharePoint Framework component";
  }

  public getTelemetryProperties(args: CommandArgs): any {
    const telemetryProps: any = super.getTelemetryProperties(args);
    telemetryProps.oldName = args.options.oldName;
    return telemetryProps;
  }

  public options(): CommandOption[] {
    const options: CommandOption[] = [
      {
        option: "--newName <newName>",
        description: "New name for the component",
      },
      {
        option: "--oldName <oldName>",
        description: "Old name for the component",
      },
    ];

    const parentOptions: CommandOption[] = super.options();
    return options.concat(parentOptions);
  }

  public commandAction(
    logger: Logger,
    args: CommandArgs,
    cb: (err?: any) => void
  ): void {
    this.projectRootPath = this.getProjectRoot(process.cwd());
    if (this.projectRootPath === null) {
      cb(
        new CommandError(
          `Couldn't find project root folder`,
          SpfxComponentRenameCommand.ERROR_NO_PROJECT_ROOT_FOLDER
        )
      );
      return;
    }

    const webpartFolderPath = path.join(
      this.projectRootPath,
      "src",
      "webparts",
      args.options.oldName
    );

    if (this.debug) {
      logger.log(
        `Renaming SharePoint Framework component '${args.options.oldName}' to '${args.options.newName}'`
      );
    }

    try {
      this.replaceMystringsFileContent(
        path.join(webpartFolderPath, "loc", "mystrings.d.ts"),
        args,
        logger
      );
      //this.replaceYoRcJsonContent(path.join(this.projectRootPath, '.yo-rc.json'), newId, args, cmd);
      //this.replacePackageSolutionJsonContent(path.join(this.projectRootPath, 'config', 'package-solution.json'), projectName, newId, args, cmd);
      //this.replaceDeployAzureStorageJsonContent(path.join(this.projectRootPath, 'config', 'deploy-azure-storage.json'), args, cmd);
      //this.replaceReadMeContent(path.join(this.projectRootPath, 'README.md'), projectName, args, cmd);
    } catch (error) {
      cb(new CommandError(error));
      return;
    }

    if (this.verbose) {
      logger.log("DONE");
    }

    cb();
  }

  public commandHelp(args: any, log: (message: string) => void): void {}

  private replaceMystringsFileContent = (
    filePath: string,
    args: CommandArgs,
    logger: Logger
  ) => {  

    if (this.debug) {
      logger.log(`Updating ${filePath}`);
    }

    if (!fs.existsSync(filePath)) {
      return;
    }

    const existingContent: string = fs.readFileSync(filePath, "utf-8");
    const updatedContent = existingContent.replace(
      new RegExp(args.options.oldName, "g"),
      args.options.newName
    );   

    if (updatedContent !== existingContent) {
      fs.writeFileSync(filePath, updatedContent, "utf-8");

      if (this.debug) {
        logger.log(`Updated ${path.basename(filePath)}`);
      }
    }
  };
}

module.exports = new SpfxComponentRenameCommand();
