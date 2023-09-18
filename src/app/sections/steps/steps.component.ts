import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss'],
})
export class StepsComponent implements OnInit {
  stepList: { title: string; subTitle: string; code: string; language: string }[] = [
    {
      title: 'Install package',
      subTitle: '',
      code: `
  ng add @ngneat/hot-toast
  # Or with npm
  npm install @ngneat/overview@^5.1.0 @ngneat/hot-toast
  # Or with yarn
  yarn add @ngneat/overview@^5.1.0 @ngneat/hot-toast`,
      language: 'bash',
    },
    {
      title: 'Import Toaster in your app',
      subTitle: 'You can set options here',
      code: `
  // Module Setup
  import { HotToastModule } from '@ngneat/hot-toast';

  @NgModule({
    imports: [HotToastModule.forRoot()],
  })
  export class AppModule {}

  // Standalone Setup
  import { AppComponent } from './src/app.component';

  import { provideHotToastConfig } from '@ngneat/hot-toast';

  bootstrapApplication(AppComponent, {
    providers: [
      provideHotToastConfig(), // @ngneat/hot-toast providers
    ]
  });`,
      language: 'typescript',
    },
    {
      title: 'Start toasting!',
      subTitle: 'Call it from anywhere in the component',
      code: `
  import { HotToastService } from '@ngneat/hot-toast';

  @Component({})
  export class AppComponent {
  private toastService = inject(HotToastService);

  showToast() {
    this.toastService.show('Hello World!')
  }`,
      language: 'typescript',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
