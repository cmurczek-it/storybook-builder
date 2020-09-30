import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { buildDevStandalone } from '@storybook/core/dist/server/build-dev';
import { StorybookBuilderOptions } from '.';
import { createArchitect, host } from '../test-utils';

const mockStorybookServer = jest.fn().mockImplementation((options: StorybookBuilderOptions) => Promise.resolve());
jest.mock('@storybook/core/dist/server/build-dev', () => ({
  buildDevStandalone: mockStorybookServer,
}));

describe('storybook-builder', () => {
  describe('dev-server', () => {
    let architect: Architect;
    let architectHost: TestingArchitectHost;
    const appTarget = { project: 'app', target: 'storybook' };
    const libTarget = { project: 'lib', target: 'storybook' };

    beforeEach(async () => {
      await host.initialize().toPromise();
      const testbed = await createArchitect(host.root());
      architect = testbed.architect;
      architectHost = testbed.architectHost;
      architectHost.addTarget(appTarget, 'storybook-builder:dev-server');
      architectHost.addTarget(libTarget, 'storybook-builder:dev-server');
    });

    afterEach(async () => {
      await host.restore().toPromise();
    });

    it('should start storybook using the defaults', async () => {
      const builderRun = await architect.scheduleTarget(appTarget, { ci: true });
      expect(mockStorybookServer).toHaveBeenCalledWith({
        ci: true,
        configDir: `${architectHost.workspaceRoot}/projects/app/.storybook`,
        host: 'localhost',
        port: 4400,
        ...(await import('@storybook/angular/dist/server/options')).default,
      });
      await builderRun.stop();
    });
  });
});
