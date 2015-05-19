

 function completePaths(data) {
     var sigPages = _.unique(data.map(function (d) {return d.page;}))
         .sort(function (a, b) {return a - b;});

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

 var d = []
 var data_ints = [
     {"char":"green", "page":[1, 20]},
     {"char":"red", "page":[20, 60]},
     {"char":"brown", "page":[40, 120]},
     {"char":"green", "page":[100, 160]},
     {"char":"pink", "page":[140, 160]},
 ]

 function buildIntervals(pageSize, chars, data) {
     charStart = {}; //The first line they were mentioned
     charLast = {}; //How many lines since they were mentioned
     chars.forEach(function (character) {charLast[character] = 0;});
     newData = [];
     data.forEach(function(d, i) {
         d.forEach(function(character) {
             charLast[character] = 0;
             if (!charStart[character])
                 charStart[character] = Math.floor(i / pageSize);
         });
         chars.forEach(function(character) {
             charLast[character]++;
             if (charStart[character] && charLast[character] > pageSize) {
                 newData.push({'char':character, 
                               'page':[charStart[character], Math.ceil(i / pageSize)]})
                 charStart[character] = undefined;
                 charLast[character] = 0;
             }
         });
     })
     return newData;
 }

/*
dataTest = [[], [], [], ['r', 'b', 'g'], ['r', 'b'], ['r'], ['r','g'], ['r'], [], [], []]
console.log(buildIntervals(2, ['r','g', 'b'], dataTest));
*/
/*
d3.json("/data/blackar.txt",function (data) {
    chars = _.unique(_.flatten(data));
    console.log(buildIntervals(40, chars, data));
});
*/

 function getGroups(paths){
     var pageGroups = {}
     transpose(_.values(paths)).forEach(function(pageChars) {
         pagePresent = pageChars.filter(function(d) {return d.present;});
         if (pagePresent.length > 0)
             pageGroups[pagePresent[0].page] = pagePresent.map(function(d) {return d.char;});         
     });
     return pageGroups;
 }

 function groupNumber(character, page, paths, chars, defaultGroup){
     pageGroups = getGroups(paths)
     group = pageGroups[page];
     if (_.contains(group, character)){
         if (defaultGroup >= 0)
             return defaultGroup;
         return d3.median(group.map(function (c) {return chars.indexOf(c) + 1;}));
     }
     return chars.indexOf(character) + 1;
 }

 function transpose(a) { return _.zip.apply(_, a);} 
