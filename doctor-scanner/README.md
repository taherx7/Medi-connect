# Doctor Scanner Module

This is a standalone module to scan images for the Arabic word "طبيب".

## How to use in another project

1. **Copy** this entire `doctor-scanner` folder into your project.
2. Open your terminal inside this folder and run:
   ```bash
   npm install
   ```
3. In your code, import it like this:

   ```javascript
   // Adjust the path to where you put the folder
   const { scan } = require('./doctor-scanner');

   async function test() {
       const isDoctor = await scan("https://example.com/image.jpg");
       console.log(isDoctor); // true or false
   }
   
   test();
   ```
