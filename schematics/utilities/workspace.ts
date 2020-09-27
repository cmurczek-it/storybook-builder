import { normalize, workspaces } from '@angular-devkit/core';
import { WorkspaceFileNotFoundException } from '@angular-devkit/core/src/experimental/workspace';
import { noop, Rule, Tree } from '@angular-devkit/schematics';

export function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new WorkspaceFileNotFoundException(normalize(path));
      }
      return data.toString('utf-8');
    },
    async writeFile(path: string, content: string): Promise<void> {
      return tree.overwrite(path, content);
    },
    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}

export async function getWorkspace(tree: Tree, path = '/'): Promise<workspaces.WorkspaceDefinition> {
  const host = createHost(tree);
  const { workspace } = await workspaces.readWorkspace(path, host);
  return workspace;
}

export function updateWorkspace(
  updater: (workspace: workspaces.WorkspaceDefinition) => void | Rule | PromiseLike<void | Rule>
): Rule;
export function updateWorkspace(workspace: workspaces.WorkspaceDefinition): Rule;
export function updateWorkspace(
  updaterOrWorkspace:
    | workspaces.WorkspaceDefinition
    | ((workspace: workspaces.WorkspaceDefinition) => void | Rule | PromiseLike<void | Rule>)
): Rule {
  return async (tree: Tree) => {
    const host = createHost(tree);
    if (typeof updaterOrWorkspace === 'function') {
      const { workspace } = await workspaces.readWorkspace('/', host);
      const result = await updaterOrWorkspace(workspace);
      await workspaces.writeWorkspace(workspace, host);
      return result || noop();
    } else {
      await workspaces.writeWorkspace(updaterOrWorkspace, host);
      return noop();
    }
  };
}
