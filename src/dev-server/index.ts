import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { experimental, join, json, normalize } from '@angular-devkit/core';
import { buildDevStandalone } from '@storybook/core/dist/server/build-dev';
import * as fs from 'fs';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export type StorybookBuilderOptions = json.JsonObject & {
  ci: boolean;
  configDir: string;
  host: string;
  port: number;
  staticDirs?: string;
  sslCa?: string;
  sslCert?: string;
  sslKey?: string;
};

export type StorybookBuilderOutput = json.JsonObject &
  BuilderOutput & {
    output: {
      host: string;
      port: number;
    };
  };

type StorybookDevServerOptions = Partial<StorybookBuilderOptions> & {
  packageJson: any;
  framework: string;
  frameworkPresets: string[];
  https?: boolean;
};

function devServer(
  builderOptions: Partial<StorybookBuilderOptions>,
  context: BuilderContext
): Observable<StorybookBuilderOutput> {
  return combineLatest([
    fs.promises.readFile(join(normalize(context.workspaceRoot), 'angular.json')),
    import('@storybook/angular/dist/server/options'),
  ]).pipe(
    map(([workspaceBuffer, ngOptions]) => {
      if (workspaceBuffer.length === 0) {
        throw new Error('angular.json not found');
      }
      const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(workspaceBuffer.toString('utf8'));
      const projectName = context.target?.project || workspace.defaultProject;
      const options: StorybookDevServerOptions = {
        ...builderOptions,
        configDir: `${context.workspaceRoot}/${workspace.projects[projectName!].root}/${builderOptions.configDir}`,
        docsMode: false,
        ignorePreview: false,
        ...ngOptions.default,
      };
      if (builderOptions.sslCert || builderOptions.sslKey) {
        options.https = true;
      } else {
        delete options.sslCa;
        delete options.sslCert;
        delete options.sslKey;
      }
      return options;
    }),
    switchMap((options) => {
      return new Observable<StorybookBuilderOutput>((obs) => {
        buildDevStandalone(options)
          .then(() =>
            obs.next({
              success: true,
              output: { host: builderOptions.host, port: builderOptions.port },
            } as StorybookBuilderOutput)
          )
          .catch((err) => obs.error(err));
      });
    })
  );
}

export default createBuilder<StorybookBuilderOptions, StorybookBuilderOutput>(devServer);
