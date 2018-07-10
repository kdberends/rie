function parseData(rawData){
    // let's start with a single line

    x = rawData.x

    parsedData = {'meta': {'tooltips':['Very high confidence', 
                                       'High confidence', 
                                       'Medium confidence', 
                                       'Low confidence']}, 

                  'data':[]}
    for (var i = 0; i < x.length; i++){
        parsedData.data.push({"x": x[i],
                         "y":rawData.cdfs[i][50],

                         "p":[
                              [rawData.cdfs[i][5], rawData.cdfs[i][95]],
                              [rawData.cdfs[i][10], rawData.cdfs[i][90]],
                              [rawData.cdfs[i][25], rawData.cdfs[i][75]],
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