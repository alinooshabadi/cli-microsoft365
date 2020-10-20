import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import appInsights from "../../../../appInsights";
import { Logger } from "../../../../cli";
import Command from "../../../../Command";
import Utils from "../../../../Utils";
import commands from "../../commands";
const command: Command = require("./component-rename");

describe(commands.COMPONENT_RENAME, () => {
  let log: any[];
  let logger: Logger;
  let trackEvent: any;
  let telemetry: any;
  let writeFileSyncSpy: sinon.SinonStub;
  const projectPath: string =
    "src/m365/spfx/commands/project/test-projects/spfx-182-webpart-react";

  before(() => {
    trackEvent = sinon.stub(appInsights, "trackEvent").callsFake((t) => {
      telemetry = t;
    });
  });

  beforeEach(() => {
    log = [];
    logger = {
      log: (msg: string) => {
        log.push(msg);
      },
    };
    telemetry = null;
    writeFileSyncSpy = sinon.stub(fs, "writeFileSync").callsFake(() => {});
  });

  afterEach(() => {
    Utils.restore([
      (command as any).oldName,
      (command as any).newName,
      (command as any).getProjectRoot,
      fs.existsSync,
      fs.readFileSync,
      fs.writeFileSync,
    ]);
  });

  after(() => {
    Utils.restore([appInsights.trackEvent]);
  });

  it("has correct name", () => {
    assert.strictEqual(
      command.name.startsWith(commands.COMPONENT_RENAME),
      true
    );
  });

  it("calls telemetry", () => {
    sinon
      .stub(command as any, "getProjectRoot")
      .callsFake((_) => path.join(process.cwd(), projectPath));

    command.action(
      logger,
      { options: { oldName: "old-spfx-react", newName: "spfx-react" } },
      () => {
        assert(trackEvent.called);
      }
    );
  });

  it("logs correct telemetry event", () => {
    sinon
      .stub(command as any, "getProjectRoot")
      .callsFake((_) => path.join(process.cwd(), projectPath));

    command.action(
      logger,
      { options: { oldName: "old-spfx-react", newName: "spfx-react" } },
      () => {
        assert.strictEqual(telemetry.name, commands.COMPONENT_RENAME);
      }
    );
  });

  it("replaces component name in mystrings.d.ts", (done) => {
    sinon
      .stub(command as any, "getProjectRoot")
      .callsFake((_) => path.join(process.cwd(), projectPath));

    const replacedContent = 
`declare interface IGoodbyeWorldWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'GoodbyeWorldWebPartStrings' {
  const strings: IGoodbyeWorldWebPartStrings;
  export = strings;
}
`;

    command.action(
      logger,
      { options: { oldName: "HelloWorld", newName: "GoodbyeWorld" } },
      (err?: any) => {
       
        try {              
          assert(
            writeFileSyncSpy.calledWith(
              sinon.match.string,
              sinon.match((updatedContent)=>{
               return updatedContent.replace(/\s/g, "") == replacedContent.replace(/\s/g, "")}),
              "utf-8"
            )
          );         
          done();
        } catch (ex) {
          done(ex);
        }
      }
    );
  });
});
