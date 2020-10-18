import * as fs from "fs";
import * as path from "path";
import { CommandError } from "../../../../Command";
import GlobalOptions from "../../../../GlobalOptions";
import commands from "../../commands";
import { BaseProjectCommand } from "./base-project-command";
import { Logger } from "../../../../cli";

interface CommandArgs {
  options: Options;
}

interface Options extends GlobalOptions {
  newName: string;
  generateNewId?: boolean;
}

class SpfxComponentRenameCommand extends BaseProjectCommand {
  public static ERROR_NO_PROJECT_ROOT_FOLDER: number = 1;

  public get name(): string {
    return commands.COMPONENT_RENAME;
  }

  public get description(): string {
    return "Renames SharePoint Framework component";
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

    //const packageJson: any = this.getProject(this.projectRootPath).packageJson;
    //const projectName: string = packageJson.name;

    if (this.debug) {
      logger.log(
        `Renaming SharePoint Framework component to '${args.options.newName}'`
      );
    }

    try {
      this.replacePackageJsonContent(
        path.join(this.projectRootPath, "package.json"),
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

  public commandHelp(args: any, log: (message: string) => void): void {
    console.log("salam");
  }

  private replacePackageJsonContent = (
    filePath: string,
    args: CommandArgs,
    logger: Logger
  ) => {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const existingContent: string = fs.readFileSync(filePath, "utf-8");
    const updatedContent = JSON.parse(existingContent);

    if (updatedContent && updatedContent.name) {
      updatedContent.name = args.options.newName;
    }

    const updatedContentString: string = JSON.stringify(
      updatedContent,
      null,
      2
    );

    if (updatedContentString !== existingContent) {
      fs.writeFileSync(filePath, updatedContentString, "utf-8");

      if (this.debug) {
        logger.log(`Updated ${path.basename(filePath)}`);
      }
    }
  };
}

module.exports = new SpfxComponentRenameCommand();
