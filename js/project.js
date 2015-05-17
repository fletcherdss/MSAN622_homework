

 function completePaths(data) {
     filledPaths = {};
     var chars = _.unique(data.map(function (d) {return d.char;}))
     chars.forEach(function(character) {
         var charData = data.filter(function(d) {return d.char == character;})
                            .sort(function(a, b) {return a.page - b.page;});
         //console.log(charData);
         charData.forEach(function(d, i) {d.present = i % 2 == 0;})
         var filledPath = _.clone(sigPages);
         var i = 0;

         filledPath.forEach(function(page, j) {
             if (i >= charData.length)
                 p = false;
             else if (charData[i].page == page){
                 p = true; 
                 i++;
             }
             else
                 p = !charData[i].present;
             filledPath[j] = {"char":character, "page":page, "present":p};
         });

         filledPaths[character] = filledPath;
     });
     return filledPaths;
 };

 function trimPath(path) {
     path2 = path.slice()
     while (path2.length > 0 && !path2.slice(-1)[0].present){
         path2.pop()
     }
     return path2;
 }

