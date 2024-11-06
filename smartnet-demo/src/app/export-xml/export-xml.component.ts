export class XmlExportService {
    private petsIndex: number = 0;
    private petIndex: number = 0;

    exportToXml(universityData: any): string {
        universityData.ProfessorComments = [
            "loves his job",
            "Loves Fishing",
            "His BIRTHDAY IS SOON!!!",
            "Andrew4 has 5 kids!!!"
        ];

        universityData.StudentComments = [
            "Loves to cook",
            "Lives Alone",
            "Terrible at sports",
            "loves traveling"
        ];

        universityData.PetsComments = [
            "has more pets, collect more info",
            "",
            "condsiders getting a goat",
            "looney tunes"
        ];

        universityData.PetComments = [
            "his favorite pet",
            "dog is really old",
            "",
            "fast and furious",
            "",
            "mouse survives despite all odds"
        ];

        universityData.GradeComments = [
            "",
            "",
            "should give him another chance",
            "",
            "",
            "",
            "",
            "",
            "he had a bad day",
            "" 
        ];

        let xmlString = 
            `<University Name="Smartnet_Technologies_Demo" Version="1.0">\n\n    <!--all these are great professors-->\n`;

        xmlString += `${this.generateSection('Professors', universityData.Professors, universityData.ProfessorComments)}\n`;

        xmlString += `  <!--students from all around the world-->\n    ${this.generateSection('Students', universityData.Students, universityData.StudentComments, universityData.PetsComments, universityData.PetComments)}\n`;

        xmlString += `  <!--all grades for all students-->\n    ${this.generateSection('Grades', universityData.Grades, universityData.GradeComments)}`;

        xmlString += '</University>';
        return xmlString;
    }

    private generateSection(sectionName: string, data: any[], sectionComments: string[], petsComments: string[] = [], petComments: string[] = []): string {
        let sectionString = '';
        let singleForm = sectionName.slice(0, -1);

        // Add section header with comment if available
        sectionString += `        <${sectionName} Comment="${data[0]?.attributes?.Comment?.value || 'No comment available'}">\n`;

        // Loop through items in each section
        for (let i = 0; i < data[0]['children'][singleForm].length; i++) {
            const item = data[0]['children'][singleForm][i];
            const itemComment = sectionComments[i] || '';
            const pets = item.children.Pets || [];
            sectionString += this.generateItem(sectionName, item, itemComment, pets, petsComments, petComments);
        }

        sectionString += `        </${sectionName}>\n`;
        return sectionString;
    }

    private generateItem(sectionName: string, item: any, itemComment: string, pets: any[], petsComments: string[], petComments: string[]): string {
        let itemString = '';
    
        switch (sectionName) {
            case 'Professors':
                itemString = `            <!--${itemComment}-->\n`;
                itemString += `            <Professor Id="${item.attributes.Id?.value}" Name="${item.attributes.Name?.value}" LastName="${item.attributes.LastName?.value}" PhoneNumber="${item.attributes.PhoneNumber?.value}" Address="${item.attributes.Address?.value}"`;
    
                Object.keys(item.attributes).forEach(key => {
                    if (key !== 'Id' && key !== 'Name' && key !== 'LastName' && key !== 'PhoneNumber' && key !== 'Address') {
                        itemString += ` ${key}="${item.attributes[key]?.value}"`;
                    }
                });
    
                itemString += `/>\n`;
                break;
    
            case 'Students':
                itemString = `            <!--${itemComment}-->\n`;
                itemString += `            <Student StudentId="${item.attributes.StudentId?.value}" StudentName="${item.attributes.StudentName?.value}" StudentLastName="${item.attributes.StudentLastName?.value}" StudentPhoneNumber="${item.attributes.StudentPhoneNumber?.value}" StudentAddress="${item.attributes.StudentAddress?.value}" Country="${item.attributes.Country?.value || ''}">\n`;
    
                // Add pets with comments and attributes
                if (pets['children'].Pet.length > 0) {
                    itemString += this.handlePets(pets, petsComments, petComments, this.petsIndex, this.petIndex);
                    this.petsIndex++
                }
    
                itemString += `            </Student>\n`;
                break;
    
            case 'Grades':
                itemString = itemComment ? `\n            <!--${itemComment}-->\n` : '\n';
                itemString += `            <Grade Id="${item.attributes.Id?.value}" Lecture="${item.attributes.Lecture?.value}" Grade="${item.attributes.Grade?.value}" StudentId="${item.attributes.StudentId?.value}" ProfessorId="${item.attributes.ProfessorId?.value}"`;
    
                Object.keys(item.attributes).forEach(key => {
                    if (key !== 'Id' && key !== 'Lecture' && key !== 'Grade' && key !== 'StudentId' && key !== 'ProfessorId') {
                        itemString += ` ${key}="${item.attributes[key]?.value}"`;
                    }
                });
    
                itemString += `/>`;
                break;
        }
    
        return itemString;
    }
    
    private handlePets(pets: any[], petsComments: string[], petComments: string[], petsIndex: number, petIndex: number): string {
        let petsString = '';
        let petsAttrName = Object.keys(pets['attributes'])
    
        petsString += petsComments[this.petsIndex] == "" ? '' : `                <!--${petsComments[this.petsIndex]}-->\n`;
        petsString += petsAttrName.length != 0 ? `                <Pets ${petsAttrName}="${pets['attributes'][petsAttrName]?.value}">\n` : `              <Pets>\n`
        
        pets['children']['Pet'].forEach((pet: any) => {
            const petComment = petComments[this.petIndex] || '';
            this.petIndex++
            const petAttributes = pet.attributes;
            let petString = '';
    
            // Assigning pet comment
            petString += petComment != '' ? `                    <!--${petComment}-->\n` : '';
    
            // Handling additional attributes and comments for the pet
            petString += `                    <Pet Name="${petAttributes.Name?.value}" Species="${petAttributes.Species?.value}"`;
    
            if (petAttributes.CommentForPet) {
                petString += ` CommentForPet="${petAttributes.CommentForPet?.value}"`;
            }
    
            // Add custom attributes if available
            if (petAttributes.Info) {
                petString += ` Info="${petAttributes.Info?.value}"`;
            }
            if (petAttributes.Observation) {
                petString += ` Observation="${petAttributes.Observation?.value}"`;
            }
            if (petAttributes.FunFact) {
                petString += ` FunFact="${petAttributes.FunFact?.value}"`;
            }
    
            petString += `/>\n`;
            petsString += petString;
        });

        petsString += '                </Pets>\n'

        return petsString;
    }    
}
