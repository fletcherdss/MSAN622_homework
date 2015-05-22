

function builtCompletePaths(pageSize, chars, rawData) {
     data_ints = buildIntervals(pageSize, chars, rawData);
     var data = _.flatten(data_ints.map(function(d) {
         return [{"char":d.char, "page":d.page[0], "present":true}, 
                 {"char":d.char, "page":d.page[1], "present":false}];
     }));         
     return  completePaths(data);
}

function completePaths(data) {
     var sigPages = _.unique(data.map(function (d) {return d.page;}))
         .sort(function (a, b) {return a - b;});
//     sigPages = intersperse(sigPages);
     filledPaths = {};
     charGroups = _.groupBy(data, function(d) {return d.char;})
     _(charGroups).forEach(function(charData, character) {
         var filledPath = []; 
         var i = 0;
         sigPages.forEach(function(page, j) {
             if (i >= charData.length)
                 p = false;
             else if (charData[i].page == page){
                 p = true;  
                 i++;
             }
             else if (charData[i].page > page)
                 p = !charData[i].present;
             filledPath.push({"char":character, "page":page, "present":p});
         });
         filledPaths[character] = filledPath;
     });
     return filledPaths;
}

function intersperse(ar) {
    i = 0;
    ar2 = [];
    for (var i = 1; i < ar.length; i++){
        ar2.push(ar[i-1], (ar[i-1] + ar[i])/2);
    }
    ar2.push(_.last(ar))
    return ar2;
}

function trimPath(path) {
    path2 = path.slice()
    while (path2.length > 0 && !path2.slice(-1)[0].present){
        path2.pop()
    }
    return path2;
}

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
    var a0 = rs[0][0]; var b0 = rs[0][1];
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
    if (_.last(new_intervals) != [a0, b0])
        new_intervals.push([a0,b0]);
    return new_intervals;
}

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

 function getKLargestKeys(bins) {
     ordered = _.map(bins, function(count, character) {return [count, character];})
         .sort(function (a, b) {return b[0] - a[0];}).map(function (d) {return d[1];});
     return ordered.filter(function(x, i) {return i < 9;});
 }

 function flattenPaths(chars, paths){
     flatpath = chars.map(function(character) {return paths[character];})
         .reduce(function(memo, path) {
             path.forEach(function(d) {
                 if (d.present) {
                     if (memo[d.page])
                         memo[d.page].push(d.char);
                     else
                         memo[d.page] = [d.char];
                 }
             });
             return memo;
         } , {});
     return flatpath;
 }
