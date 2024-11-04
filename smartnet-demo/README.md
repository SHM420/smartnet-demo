# SmartnetDemo

Intellectual property of Smartnet Technologies

# TOPIC:

Archived with this project is smartnet-demo.xml file which will be the focus of this project.

smartnet-demo.xml file is used as storage for relational data.

Goal of the project is to read XML file and import all of its data and create UI for its editing and then later (on demand) export XML with the changed data while preserving unchanged data.

Parsed data should be stored in localStorage of the browser.

In src/app/types are defined enums (entities) that we know exist in the XML file, and inside each enum (entity) are some of the XML attributes that we
expect to find in each XML tag (entry). We will use these enums to get XML attributes.

In some of the XML tags (entries) you will notice some attributes that are not in the enums, we consider these attributes 'unknown attributes'.
Goal is to preserve them for each entity and export them unchanged when exporting XML document.

Above some XML tags you will notice comments that the editor of the file has made. These should not be editable in the UI, but should be preserved on export too.

Exported XML should look as similarly as possible to imported XML.

# GOAL:
  - Import XML, make 'known attributes' editable in the UI, export XML with as little changes to the structure as possible and retain as much data as possible.
  - No additional packages are allowed.
  - Files in src/app/types should not be edited.

# BONUS:
  - UI look and feel is left up to you, bonus points for functionality and creativity.
  - Code is covered with meaningful tests (we use 'jest' for tests), to run tests use 'npm run test' command