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
  npm install @ngneat/overview@^5.0.0 @ngneat/hot-toast
  # Or with yarn
  yarn add @ngneat/overview@^5.0.0 @ngneat/hot-toast`,
      language: 'bash',
    },
    {
      title: 'Import Toaster in your app',
      subTitle: 'You can skip this if you installed using Angular CLI. You can set options here',
      code: `
  import { HotToastModule } from '@ngneat/hot-toast';

  @NgModule({
    imports: [HotToastModule.forRoot()],
  })
  export class AppModule {}`,
      language: 'typescript',
    },
    {
      title: 'Start toasting!',
      subTitle: 'Call it from anywhere in the component',
      code: `
  import { HotToastService } from '@ngneat/hot-toast';

  @Component({})
  export class AppComponent {
    constructor(private toastService: HotToastService) {}
  }

  showToast() {
    this.toastService.show('Hello World!')
  }`,
      language: 'typescript',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
