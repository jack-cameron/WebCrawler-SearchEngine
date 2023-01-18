const {Matrix} = require("ml-matrix");

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/comp4601a1', {useNewUrlParser: true});

let Page = require('./Page.js');

  let P = Matrix.zeros(1000, 1000);
  Page.find({}, (err, pages) => {

    //setting up adjacency matrix
    pages.map(pages => {
      pages.outgoing.forEach(element => {
        //P[i][j] = 1 if node i links to node j, otherwise the entry will stay as a 0
        P.set(pages.name.slice(2), element.slice(2), 1);
      });
    });
    
    //set each entry to 1 divided by the number of 1s in that row
    sumOfRows = P.sum('row')
    for(let i = 0; i < P.rows; i++) {
      for(let j = 0; j < P.columns; j++) {
        //if a row has no 0s, set each entry to 1/N, N is 1000 in this case
        if(sumOfRows[i] == 0){
          P.set(i, j, 1/1000);
        } else {
          P.set(i, j, P.get(i, j)/sumOfRows[i]);
        }
      }
    }
    let x0 = Matrix.zeros(1, 1000);
    x0.set(0, 0, 1);
    //multiply the resulting matrix by (1-alpha), alpha = 0.1
    P.multiply(1-0.1);
    //add alpha/N 
    P.add(0.1/1000);

    // multiply vector by our matrix until euclidian distance is less than 0.0001
    let flag = true;
    let count = 0;
    while(flag) {
      console.log("iteration #: " + count);
      count++;
      if(eucDistance(x0, x0.mmul(P)) < 0.0001) {
        flag = false;
      } else {
        x0 = x0.mmul(P);
      }
      
      console.log(x0);
    }
    
    //let pageRankValues = [];
    for(let i = 0; i<P.rows; i++){
      /*let page = {"page" : "N-" + i,
                  "url": `https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-${i}.html`,
                  "score": x0.get(0, i)
      }
      pageRankValues.push(page);*/
      updatePage(`N-${i}`, x0.get(0, i));

    }

    //returns top 25 pages based on PageRank values
    /*const top25 = (arr) => {
      if(25 > arr.length){
        return false;
      }
      return arr
      .slice()
      .sort((a, b) => {
        return b.score - a.score
      })
      .slice(0, 25);
    };*/
    //console.log(top25(pageRankValues));
  });

//func to calculate euclidian distance between two given vectors
function eucDistance(a, b) {
  let euc = []
  for(let i = 0; i < a.rows; i++) {
    euc[i] = (a.get(0, i) - b.get(0, i)) ** 2
  }
  let sum = euc.reduce((partialSum, a) => partialSum + a, 0);
  return Math.sqrt(sum);
}

function updatePage(pageName, prScore) {
    //console.log(pageName);
    const filter =  { name: pageName };
    const update = { pagerank: prScore };

    Page.findOneAndUpdate(filter, update, null, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("Original Doc : ",docs);
        }
    }
    );
    //doc.save();
    //console.log(doc);
    //doc.save();
}