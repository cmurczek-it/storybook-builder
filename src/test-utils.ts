import { Architect } from '@angular-devkit/architect';
import { WorkspaceNodeModulesArchitectHost } from '@angular-devkit/architect/node';
import { TestingArchitectHost, TestProjectHost } from '@angular-devkit/architect/testing';
import { getSystemPath, join, normalize, schema, workspaces, Path } from '@angular-devkit/core';
import { createConsoleLogger } from '@angular-devkit/core/node';

export const veEnabled = process.argv.some((arg) => arg === 'view-engine');
export const workspaceRoot = join(normalize(__dirname), '../testing/hello-world10');
export const host = new TestProjectHost(workspaceRoot);

export async function createArchitect(wsRoot: Path) {
  const registry = new schema.CoreSchemaRegistry();
  registry.addPostTransform(schema.transforms.addUndefinedDefaults);
  const workspaceSysPath = getSystemPath(wsRoot);
  const { workspace } = await workspaces.readWorkspace(workspaceSysPath, workspaces.createWorkspaceHost(host));
  const architectHost = new TestingArchitectHost(
    workspaceSysPath,
    workspaceSysPath,
    new WorkspaceNodeModulesArchitectHost(workspace, workspaceSysPath)
  );
  const architect = new Architect(architectHost, registry);

  if (veEnabled) {
    host.replaceInFile('tsconfig.json', `"enableIvy": true,`, `"enableIvy": false,`);
  }

  return {
    workspace,
    architectHost,
    architect,
  };
}
