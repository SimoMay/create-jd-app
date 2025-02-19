import fs from "fs-extra";
import ora from "ora";
import { ICtx, IFile } from "~types";
import { formatError } from "./helpers";

export async function execFiles(files: IFile[], ctx: ICtx) {
  await Promise.all(
    files.map(async (file) => {
      await execFile(file, ctx);
    })
  );
}

async function execFile(file: IFile, ctx: ICtx) {
  if (file.type && file.type !== "copy") {
    if (file.type === "exec") {
      if (!file.path) {
        return;
      }
      const method = await import(file.path);
      await fs.outputFile(file.to, method.default(ctx));
    } else if (file.type === "delete") {
      await fs.remove(file.to);
    } else if (file.type === "write") {
      await fs.outputFile(file.to, file.content);
    } else if (file.type === "append") {
      await fs.appendFile(file.to, file.content);
    }
  } else {
    if (!file.path) {
      return;
    }
    await fs.copy(file.path, file.to);
  }
}

export async function existsOrCreate(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    await fs.mkdir(path);
  }
  return false;
}

export async function overWriteFile(userDir: string) {
  const spinner = ora("Emptying directory").start();
  try {
    await fs.emptyDir(userDir);
    spinner.succeed("Emptied directory");
  } catch (e) {
    spinner.fail(`Couldn't empty directory: ${formatError(e)}`);
  }
}
