function parseData(rawData){
    // let's start with a single line

    x = rawData.x

    parsedData = {'meta': {'tooltips':['80', '60', '40', '20']}, 

                  'data':[]}
    for (var i = 0; i < x.length; i++){
        parsedData.data.push({"x": x[i],
                         "y":rawData.cdfs[i][50],

                         "p":[
                              [rawData.cdfs[i][10], rawData.cdfs[i][90]],
                              [rawData.cdfs[i][20], rawData.cdfs[i][80]],
                              [rawData.cdfs[i][30], rawData.cdfs[i][70]],
                              [rawData.cdfs[i][40], rawData.cdfs[i][60]],

                             ]
                         })
    }
    

    return parsedData
};

function linspace(start, stop, nsteps){
    //https://gist.github.com/davebiagioni/1ac21feb1c2db04be4e6
    delta = (stop-start)/(nsteps-1)
  return d3.range(start, stop+delta, delta).slice(0, nsteps)
}