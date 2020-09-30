import { parseJson, JsonParseMode } from '@angular-devkit/core';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getPackageJsonDependency, NodeDependencyType } from '../utilities/dependencies';
import { getWorkspace } from '../utilities/workspace';

describe('Storybook Builder', () => {
  describe('Schematics', () => {
    const schematicsRunner = new SchematicTestRunner('storybook-builder', require.resolve('../collection.json'));
    let actual: UnitTestTree;
    const workspaceOptions = {
      name: 'testWS',
      newProjectRoot: 'projects',
      version: '11.0.0',
    };
    const appOptions = {
      name: 'testApp',
    };

    const libOptions = {
      name: 'testLib',
    };

    describe('ng-add', () => {
      beforeEach(async () => {
        const wsTree = await schematicsRunner
          .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
          .toPromise();
        const tree = await schematicsRunner
          .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, wsTree)
          .toPromise();
        actual = await schematicsRunner.runSchematicAsync('ng-add', {}, tree).toPromise();
      });

      it('should install the builder as devDependency', async () => {
        const dependency = getPackageJsonDependency(actual, 'storybook-builder');
        expect(dependency?.type).toBe(NodeDependencyType.Dev);
      });

      it('should should add and update configuration files', () => {
        expect(actual.files).toContain('/projects/test-app/.storybook/tsconfig.json');
        expect(actual.files).toContain('/projects/test-app/.storybook/main.js');
      });

      it('should add the target to the default project', async () => {
        const workspace = await getWorkspace(actual);
        expect(workspace.projects.get('testApp')!.targets.get('storybook')?.builder).toBe(
          'storybook-builder:dev-server'
        );
      });

      it('should add the target to the specified project', async () => {
        const newTree = await schematicsRunner
          .runExternalSchematicAsync('@schematics/angular', 'library', libOptions, actual)
          .toPromise();
        const result = await schematicsRunner.runSchematicAsync('ng-add', { project: 'testLib' }, newTree).toPromise();
        const workspace = await getWorkspace(result);
        expect(workspace.projects.get('testLib')?.targets.get('storybook')?.builder).toBe(
          'storybook-builder:dev-server'
        );
      });
    });
  });
});
function readJsonFile(tree: UnitTestTree, path: string): any {
  return parseJson(tree.readContent(path), JsonParseMode.Loose);
}
