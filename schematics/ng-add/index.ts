import { experimental, normalize, workspaces } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  url,
  Rule,
  SchematicsException,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependencyType } from '../utilities/dependencies';
import { updateWorkspace } from '../utilities/workspace';

export interface AddBuilderOptions {
  project: string;
}

function addDepsToPackageJson(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    [{ type: NodeDependencyType.Dev, name: 'storybook-builder', version: '1.0.0' }].forEach((dependency) =>
      addPackageJsonDependency(tree, dependency)
    );
    context.addTask(new NodePackageInstallTask());
    return tree;
  };
}

function addTargetToWorkspaceProject(options: AddBuilderOptions): Rule {
  return async () => {
    return updateWorkspace((workspace) => {
      const projectName = options.project || (workspace.extensions.defaultProject as string);
      const project = workspace.projects.get(projectName);
      if (!project) {
        throw new SchematicsException(`${options.project} does not exist in workspace and no default project is set.`);
      }
      const storybookTarget: { name: string } & workspaces.TargetDefinition = {
        name: 'storybook',
        builder: 'storybook-builder:dev-server',
      };
      workspace.projects.get(projectName)!.targets.add(storybookTarget);
    });
  };
}

export function ngAdd(options: AddBuilderOptions): Rule {
  return (tree: Tree) => {
    const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(tree.read('angular.json')!.toString());
    const projectName = options.project || workspace.defaultProject;
    const project = workspace.projects[projectName!];
    const projectType = project.projectType === 'application' ? 'app' : 'lib';
    const templates = apply(url('./files'), [applyTemplates({ projectType }), move(normalize(project.root))]);
    return chain([addTargetToWorkspaceProject(options), mergeWith(templates), addDepsToPackageJson()]);
  };
}
