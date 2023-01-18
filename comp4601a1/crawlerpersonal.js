const Crawler = require("crawler");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/comp4601a1personal', {useNewUrlParser: true});


let Page = require('./Page.js');

let visited = [];

const c = new Crawler({
    maxConnections : 10, 

    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
          if(visited.length == 1000){
            console.log('queue is full');
          } else {
            let $ = res.$; //get cheerio data, see cheerio docs for info

            console.log($("title").text() + " currently being crawled");
            
            let links = $("a");
  
            let paragraphs = $("p").text();
            //console.log(paragraphs);
            if(visited.filter(e => e.name === $("title").text()).length == 0) {     
            
              let linkObj = {"name": `${$("title").text()}`, "content": paragraphs, "incoming": [], "outgoing": []}
              visited.push(linkObj);
              
              let objIndex = visited.findIndex(obj => obj.name === $("title").text());
  
              $(links).each(function(i, link) {
                visited[objIndex].outgoing.push($(link).attr('href'));     
                
                //console.log($(link).attr('href'));    
              });
  
              visited[objIndex].outgoing.forEach(ele => {
                //console.log(ele);
                if(ele){
                    c.queue(ele)
                }
                 
              });
              
            } else {         
              console.log("page already crawled");
            }
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
c.queue("https://breakingbad.fandom.com/wiki/Breaking_Bad_Wiki");