# Rules and standards for CHKM8

## IDE

-   Use Visual Studio Code
    -   Install ESLINT
    -   Install Prettier
-   Install ESLINT with NPM    ```sudo npm install eslint -g```

## Folder structure

```
-src | App source files
    - cdn | Content Delivery Network folder
        - js | Client javascript
        - css | CSS
        - img | Public images
    - views | All webpages built with PUG
    - routes | Route fiels
    - controllers | Controller files,
    - test | Test folder

- press
    Source files (psd, ai), Logos and concept art
```


## Using classes from other files

When using a class from another file, always name your housing variable the same name as the class, and load it like in the example!
```javascript
const Project = new (require('./Project.js'))();
```