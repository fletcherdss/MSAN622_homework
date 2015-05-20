

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
                 charStart[character] = i;
         });
         chars.forEach(function(character) {
             charLast[character]++;
             if (charStart[character] && charLast[character] > pageSize) {
                 newData.push({'char':character, 
                               'page':[Math.floor(charStart[character] / pageSize),
                                       Math.ceil(i / pageSize)]
                               //'page':[charStart[character], i]
                              });
                 charStart[character] = undefined;
                 charLast[character] = 0;
             }
         });
     })
     return reduce_intervals(newData);
 }

 function reduce_intervals(data_ints) {
     gp = _.groupBy(data_ints, function (d) {return d.char;});
     keys = _.keys(gp);
     reduced_data = keys.map(function(k) {
         ints_k = gp[k].map(function(i) {return i.page});
         merged_ints_k = merge_intervals(ints_k);
         return merged_ints_k.map(function(i) {return {"char":k, "page":i};});
     });
     return _.flatten(reduced_data);
 }

 //TODO: will not work for large values. Also untested.
 function merge_intervals(intervals) {
     if (intervals.length == 0)
         return [];

    new_intervals = []
    rs = intervals.sort(function(a, b) {
        return (a[0] - b[0])*100000 + (a[1] - b[1]);});
    var a0 = rs[0][1]; var b0 = rs[0][1];
    var a; var b;
    rs.forEach(function (interval) {
        a = interval[0]; b = interval[1];
        if (a - b0 <= 1)
            b0 = b;
        else {
            new_intervals.push([a0, b0])
            a0 = a; b0 = b;
        }
    });
    new_intervals.push([a,b]);
    return new_intervals;
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

 function cumulativeSum(chars, rawData, page_size) {
     var lines = rawData.length;
     csum = [];
     csum.push(_.object(chars, chars.map(function (d) {return 0;}))) ;
     page = 0;
     rawData.forEach(function(d, i) {
         if (i % page_size == 0){
             page++;
             csum[page] = {}
             chars.forEach(function(character){
                 csum[page][character] = csum[page-1][character];
             });
         }
         d.forEach(function(character) {
             csum[page][character] = csum[page][character] + 1;
         });        
     });
     melted = csum.map(function (d, i) {
         return _.pairs(d).filter(function (p) {return p[1] >= 0;})
                 .map(function (p) {return {"page":i, "name":p[0], "count":p[1]};});
     });
     return _.groupBy(_.flatten(melted), function(d){return d.name;});
         
 }
