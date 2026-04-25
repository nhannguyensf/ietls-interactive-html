IELTS Practice App
==================

How to run on Windows:

1. Extract the zip file.
2. Double-click START_APP.bat.
3. Open this address in Chrome or Edge:

   http://127.0.0.1:8080/app/listening_test.html

4. To install it like an app, use the browser install option in the address bar or browser menu.

How to rebuild the share zip:

1. Make your edits.
2. Double-click PACKAGE_APP.bat.
3. Share the updated zip from:

   dist/IELTS_Practice_App.zip

How to host on GitHub Pages:

1. Push this folder to a GitHub repository.
2. In GitHub, open Settings > Pages.
3. Set Source to "Deploy from a branch".
4. Choose the branch you use, usually "main".
5. Choose "/ (root)" as the folder.
6. Save.
7. Open the Pages URL GitHub gives you.

The root page is index.html and links to both tests.

Notes:

- Keep all files together in the same folder.
- The listening audio is included locally in the package.
- If you add the Part 2 map image later, place it here:

  assets/images/part2_plan.png

Files included:

- app/listening_test.html
- app/reading_test.html
- index.html
- README.md
- .nojekyll
- manifest.webmanifest
- service-worker.js
- assets/icons/app-icon.svg
- assets/audio/vol7_test6_listening.mp3
- scripts/start-app.ps1
- scripts/package-app.ps1
- START_APP.bat
- PACKAGE_APP.bat
