import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Professor } from '../types/Professor';
import { Student } from '../types/Student';
import { Grade } from '../types/Grade';
import { Pet } from '../types/Pet';
import { XmlExportService } from '../export-xml/export-xml.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './read-xml.component.html',
  styleUrl: './read-xml.component.scss',
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
          console.log('Parsed XML Data:', this.xmlData); 
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
    } else {
      // If no data exists, fetch new data and save to localStorage
      this.fetchData(category).then(fetchedData => {
        if (fetchedData) {
          localStorage.setItem(localStorageKey, JSON.stringify(fetchedData));

          // Display the fetched data
          this.data = fetchedData[0]?.children || {};
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

  saveData(category: 'Professors' | 'Students' | 'Grades') {
    let singleForm = category.slice(0, -1);
    let existingData = localStorage.getItem(category);
    let parsedData = JSON.parse(existingData);
    let inputElements = document.querySelectorAll('input[type="text"]');
    let inputs: any[] = [];

    // Collect inputs
    inputElements.forEach(input => {
        if (input instanceof HTMLInputElement) {
          let attributeKey = input.getAttribute('data-attribute');
          let isKnown = input.getAttribute('data-known');

          if (attributeKey) {
            let boolIsKnown = (isKnown === 'true');
            inputs.push({
                attributes: {
                  [attributeKey]: {
                    value: input.value,
                    known: boolIsKnown
                  }
                }
            });
          }
        }
    });

    if (category === 'Students') {
      let newStudentObjects: any[] = [];
      let currentIndex = 0;

      parsedData[0].children[singleForm].forEach((student: any) => {
        let newStudentObject: any = {
          attributes: {},
          children: {}
        };

        let studentAttributesLength = Object.keys(student.attributes).length;
        for (let j = 0; j < studentAttributesLength && currentIndex < inputs.length; j++) {
          const input = inputs[currentIndex];
          newStudentObject.attributes = {
            ...newStudentObject.attributes,
            ...input.attributes
          };
          currentIndex++;
        }

        // Handle pets
        if (student.children?.Pets) {
          let pets = student.children.Pets;
          
          if (pets && pets.children && pets.children.Pet) {
              newStudentObject.children.Pets = {
                attributes: pets.attributes,
                children: {}
              };

              let petArray = Array.isArray(pets.children.Pet) ? pets.children.Pet : [pets.children.Pet];

              newStudentObject.children.Pets.children.Pet = petArray.map((pet: any, petIndex: number) => {
                let petObject: any = {
                  attributes: {},
                  children: {}
                };

                let petAttributesLength = Object.keys(pet.attributes).length;
                for (let i = 0; i < petAttributesLength && currentIndex < inputs.length; i++) {
                  const petAttribute = Object.keys(pet.attributes)[i];
                  if(!inputs[currentIndex].attributes[petAttribute]) {
                    currentIndex++;
                  }

                  const input = inputs[currentIndex];
                  console.log('OVO =>', input, petAttribute)
                  if (input) {
                    petObject.attributes[petAttribute] = {
                      value: input.attributes[petAttribute].value,
                      known: input.attributes[petAttribute].known 
                    };
                    currentIndex++;
                  }
                }

                return petObject;
              });
          } else {
              console.warn('No pets found for this student:', student);
          }
        }

        newStudentObjects.push(newStudentObject);
      });

      parsedData[0].children[singleForm] = newStudentObjects;
    } else {
      const lengths = parsedData[0].children[singleForm].map((obj: any) => Object.keys(obj.attributes).length);
      let newObjects: any[] = [];
      let currentIndex = 0;

      lengths.forEach(length => {
        let newObject: any = {
          attributes: {},
          children: {}
        };

        for (let j = 0; j < length && currentIndex < inputs.length; j++) {
          const input = inputs[currentIndex];
          newObject.attributes = {
            ...newObject.attributes,
            ...input.attributes
          };
          currentIndex++;
        }

        newObjects.push(newObject);
      });

      parsedData[0].children[singleForm] = newObjects;
    }

    // Save updated data to localStorage
    localStorage.setItem(category, JSON.stringify(parsedData));
    this.showData(category);
    console.log('this.showData(category)', this.showData(category))
  }

  exportData() {
    console.log('OVO =>', this.data, this.xmlData)
    const universityData: any = {
      Name: 'Smartnet_Technologies_Demo',
      Version: '1.0',
      Professors: this.getCategoryData('Professors'),
      Students: this.getCategoryData('Students'),
      Grades: this.getCategoryData('Grades'),
    };

    // Log the constructed university data
    console.log('University Data:', universityData);
    const xmlExportService = new XmlExportService();
    const xmlString = xmlExportService.exportToXml(universityData);

    const blob = new Blob([xmlString], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'university_data.xml';
    link.click();
  }

  private getCategoryData(category: 'Professors' | 'Students' | 'Grades') {
    const categoryData = localStorage.getItem(category);
    if (categoryData) {
      return JSON.parse(categoryData);
    }
    return [];
  }
  

  keyValue(obj: any): Array<{ key: string, value: any }> {
    return Object.keys(obj).map(key => ({ key, value: obj[key] }));
  }
}
