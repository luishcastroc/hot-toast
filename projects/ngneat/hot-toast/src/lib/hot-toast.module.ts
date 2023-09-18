import { EnvironmentProviders, ModuleWithProviders, NgModule, makeEnvironmentProviders } from '@angular/core';

import { ToastConfig } from './hot-toast.model';

/**
 * @deprecated Use `provideHotToastConfig` to provide a global toast configuration.
 */
@NgModule()
export class HotToastModule {
  static forRoot(config?: Partial<ToastConfig>): ModuleWithProviders<HotToastModule> {
    return {
      ngModule: HotToastModule,
      providers: [{ provide: ToastConfig, useValue: config }],
    };
  }
}

export function provideHotToastConfig(config?: Partial<ToastConfig>): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ToastConfig, useValue: config }]);
}
