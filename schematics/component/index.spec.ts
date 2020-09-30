import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('storybook-builder', () => {
  describe('schematics', () => {
    describe('stories', () => {
      const schematicsRunner = new SchematicTestRunner('storybook-builder', require.resolve('../collection.json'));
      const workspaceOptions = {
        name: 'testWorkspace',
        newProjectRoot: 'projects',
        version: '11.0.0',
      };
      let testTree: UnitTestTree;

      beforeEach(async () => {
        const wsTree = await schematicsRunner
          .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
          .toPromise();
        const initialTree = await schematicsRunner
          .runExternalSchematicAsync('@schematics/angular', 'application', { name: 'foo' }, wsTree)
          .toPromise();
        testTree = await schematicsRunner
          .runExternalSchematicAsync('@schematics/angular', 'library', { name: 'bar' }, initialTree)
          .toPromise();
      });

      it('should add a component with a story', async () => {
        const resultTree = await schematicsRunner
          .runSchematicAsync('component', { name: 'fooBar', project: 'foo' }, testTree)
          .toPromise();
        expect(resultTree.files).toContain('/projects/foo/src/app/foo-bar/foo-bar.component.ts');
        expect(resultTree.files).toContain('/projects/foo/src/app/foo-bar/foo-bar.stories.ts');
        const story = resultTree.readContent('/projects/foo/src/app/foo-bar/foo-bar.stories.ts');
        expect(story).toMatch(/import { FooBarComponent } from '.\/foo-bar.component.ts';/s);
        expect(story).toMatch(/\s{2}component:\sFooBarComponent,/s);
        expect(story).toMatch(/export const FooBar = \(\) => \({/s);
      });
    });
  });
});
