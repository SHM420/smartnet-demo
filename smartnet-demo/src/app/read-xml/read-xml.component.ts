import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Professor } from '../types/Professor';
import { Student } from '../types/Student';
import { Grade } from '../types/Grade';
import { Pet } from '../types/Pet';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './read-xml.component.html',
  styleUrls: ["./read-xml.component.scss"],
  imports: [CommonModule]
})

export class ReadXmlComponent {
  xmlData: any;
  selectedCategory: 'Professors' | 'Students' | 'Grades' | null = null;

  constructor(private http: HttpClient) {
    this.readXml();
  }

  readXml() {
    this.http.get('/assets/smartnet-demo.xml', { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('Greška pri učitavanju XML-a:', error);
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) {
          let parsedData = this.parseXmlToJson(data);
          this.xmlData = parsedData.children;
          console.log(this.xmlData);
        }
      });
  }

  parseXmlToJson(xmlString: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Rekurzivno pretvaramo XML u JSON format
    const jsonResult = this.convertXmlToJson(xmlDoc.documentElement);
    return jsonResult;
  }

  convertXmlToJson(node: Element): any {
    const obj: any = {};

    // Dodajemo atribute elementa kao svojstva JSON objekta
    if (node.attributes.length > 0) {
      obj['attributes'] = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attribute = node.attributes[i];
        const isKnown = this.isKnownAttribute(attribute.name);
          // Dodajemo poznati atribut samo ako je isKnown true
          if (isKnown) {
            obj['attributes'][attribute.name] = {
                value: attribute.value,
                known: true // Prikazujemo samo kada je poznato
            };
          } else {
            obj['attributes'][attribute.name] = attribute.value
          }
      }
    }
  
    // Ako element ima dete-čvorove, rekurzivno ih dodajemo u JSON
    if (node.children.length > 0) {
      obj['children'] = {};

      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i];
        const childObj = this.convertXmlToJson(childNode);

        // Ako se isti tag pojavljuje više puta, pretvaramo ga u niz
        if (obj['children'][childNode.tagName]) {
          if (!Array.isArray(obj['children'][childNode.tagName])) {
            obj['children'][childNode.tagName] = [obj['children'][childNode.tagName]];
          }
          obj['children'][childNode.tagName].push(childObj);
        } else {
          obj['children'][childNode.tagName] = childObj;
        }
      }
    }
  
    return obj;
  }

  // Proverava da li je atribut poznat
  isKnownAttribute(attributeName: string): boolean {
    return Object.values(Professor).includes(attributeName as Professor) ||
           Object.values(Student).includes(attributeName as Student) ||
           Object.values(Grade).includes(attributeName as Grade) ||
           Object.values(Pet).includes(attributeName as Pet);
  }  

  // Funkcija za izbor kategorije podataka
  showData(category: 'Professors' | 'Students' | 'Grades') {
    this.selectedCategory = category;
  }

  // Funkcija za laksi prikaz podataka
  keyValue(obj: { [key: string]: any }) {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }
}
