import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';
import { ReadXmlComponent } from './app/read-xml/read-xml.component';

bootstrapApplication(ReadXmlComponent, {
  providers: [provideHttpClient()]
}).catch((err) => console.error(err));

