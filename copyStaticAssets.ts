import * as shell from "shelljs";

shell.cp("-R", "src/config", "dist/");
shell.cp("-R", "src/public/", "dist/");
