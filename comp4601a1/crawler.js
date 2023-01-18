const Crawler = require("crawler");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/comp4601a1', {useNewUrlParser: true});


let Page = require('./Page.js');

let visited = [];

const c = new Crawler({
    maxConnections : 10, 

    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
          let $ = res.$; //get cheerio data, see cheerio docs for info

          console.log($("title").text() + " currently being crawled");

          let links = $("a");

          let paragraphs = $("p").text();
          if(visited.filter(e => e.name === $("title").text()).length == 0) {     
          
            let linkObj = {"name": `${$("title").text()}`, "content": paragraphs, "incoming": [], "outgoing": []}
            visited.push(linkObj);
            
            let objIndex = visited.findIndex(obj => obj.name === $("title").text());

            $(links).each(function(i, link) {
              visited[objIndex].outgoing.push($(link).text());            
            });

            visited[objIndex].outgoing.forEach(ele => {
              c.queue("https://people.scs.carleton.ca/~davidmckenney/fruitgraph/" + ele + ".html");       
            });
            
          } else {         
            console.log("page already crawled");
          }
        done();
    }
  }
});

//Triggered when the queue becomes empty
c.on('drain',function(){
  visited.forEach(element => {
    element.pagerank = 0;
    element.outgoing.forEach(ele => {
      let objIndex = visited.findIndex(obj => obj.name === ele);
      visited[objIndex].incoming.push(element.name)
    });
  });
    visited.forEach(obj => {
        let page = new Page(obj);
        page.save();
      });
    console.log("Done.");
});


//Queue a URL, which starts the crawl
c.queue("https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html");