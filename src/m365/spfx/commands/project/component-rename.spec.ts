import * as assert from "assert";
import Command from "../../../../Command";
import commands from "../../commands";
const command: Command = require("./component-rename");

describe(commands.COMPONENT_RENAME, () => {
  it("has correct name", () => {
    assert.equal(command.name.startsWith(commands.COMPONENT_RENAME), true);
  });
});
