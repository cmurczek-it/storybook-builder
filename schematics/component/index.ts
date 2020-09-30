import { join, normalize, strings } from '@angular-devkit/core';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  mergeWith,
  move,
  url,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { Schema as ComponentSchema } from '@schematics/angular/component/schema';
import { getWorkspace } from '../utilities/workspace';

export function component(options: ComponentSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const rules: Rule[] = [];
    const workspace = await getWorkspace(tree);
    const projectName = options.project || (workspace.extensions.defaultProject! as string);
    const srcRoot = workspace.projects.get(projectName)!.sourceRoot!;
    rules.push(externalSchematic('@schematics/angular', 'component', options));
    const type = options.type || 'Component';
    const storyPath = join(
      normalize(options.path || srcRoot),
      normalize(workspace.projects.get(projectName)!.extensions.projectType === 'application' ? 'app' : 'lib'),
      normalize(dasherize(options.name))
    );
    const templateSource = apply(url('./files'), [
      applyTemplates({
        componentName: options.name,
        dasherize: strings.dasherize,
        classify: strings.classify,
        type,
        camelize: strings.camelize,
      }),
      move(storyPath),
    ]);
    rules.push(mergeWith(templateSource));
    return chain(rules);
  };
}
