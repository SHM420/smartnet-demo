import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Professor } from '../types/Professor'; // Ove tipove možeš da koristiš ako želiš
import { Student } from '../types/Student';
import { Grade } from '../types/Grade';
import { Pet } from '../types/Pet';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './read-xml.component.html',
  styleUrls: ['./read-xml.component.scss'],
  imports: [CommonModule]
})

export class ReadXmlComponent implements OnInit {
  xmlData: any;
  selectedCategory: 'Professors' | 'Students' | 'Grades' | null = null;
  data: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.readXml();
  }

  readXml() {
    this.http.get('/assets/smartnet-demo.xml', { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('Error loading XML:', error);
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) {
          this.xmlData = this.parseXmlToJson(data);
          console.log('Parsed XML Data:', this.xmlData);  // Log the parsed data
        }
      });
  }

  parseXmlToJson(xmlString: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    return this.convertXmlToJson(xmlDoc.documentElement);
  }

  convertXmlToJson(node: Element): any {
    const obj: any = {
      attributes: {},
      children: {}
    };

    // Process attributes
    if (node.attributes.length > 0) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attribute = node.attributes[i];
        obj.attributes[attribute.name] = {
          value: attribute.value,
          known: this.isKnownAttribute(attribute.name)
        };
      }
    }
  
    // Process children
    if (node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i];
        const childObj = this.convertXmlToJson(childNode);

        if (obj.children[childNode.tagName]) {
          if (!Array.isArray(obj.children[childNode.tagName])) {
            obj.children[childNode.tagName] = [obj.children[childNode.tagName]];
          }
          obj.children[childNode.tagName].push(childObj);
        } else {
          obj.children[childNode.tagName] = childObj;
        }
      }
    }
  
    return obj;
  }

  isKnownAttribute(attributeName: string): boolean {
    return Object.values(Professor).includes(attributeName as Professor) ||
           Object.values(Student).includes(attributeName as Student) ||
           Object.values(Grade).includes(attributeName as Grade) ||
           Object.values(Pet).includes(attributeName as Pet);
  }  

  showData(category: 'Professors' | 'Students' | 'Grades') {
    this.selectedCategory = category;

    // Check localStorage for existing data
    const localStorageKey = category;
    const existingData = localStorage.getItem(localStorageKey);

    if (existingData) {
      // If data exists in localStorage, parse and display it
      let parsedData = JSON.parse(existingData);
      this.data = parsedData[0].children;
      console.log(`Data for ${category} from localStorage:`, this.data);
    } else {
      // If no data exists, fetch new data and save to localStorage
      this.fetchData(category).then(fetchedData => {
        if (fetchedData) {
          localStorage.setItem(localStorageKey, JSON.stringify(fetchedData));

          // Display the fetched data
          this.data = fetchedData[0]['children'];
          console.log(`Fetched and saved data for ${category}:`, this.data);
        }
      });
    }
  }

  fetchData(category: 'Professors' | 'Students' | 'Grades'): Promise<any[]> {
    return new Promise((resolve) => {
        const children = this.xmlData?.children || {};
        const fetchedData = children[category] ? children[category] : [];

        // If fetchedData isn't Array make it
        resolve(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
    });
  }

  keyValue(obj: any): Array<{ key: string, value: any }> {
    return Object.keys(obj).map(key => ({ key, value: obj[key] }));
  }
}
