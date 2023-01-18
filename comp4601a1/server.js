const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/comp4601a1', {useNewUrlParser: true});

const express = require('express');
const app = express();

const elasticlunr = require("elasticlunr");

app.set('views', './views');
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({extended: true}));

let Page = require('./Page.js');

//logger middleware
const logger = (req, res, next) => {
  let url = req.url;
  let method = req.method;
  console.log(`${method}: ${url}`);
  next();
};

app.use(logger);

app.get("/", (req, res, next) => {
    res.status(200).render('index');
    next();
});

app.get("/fruits", (req, res, next) => {
    const topX = (arr, x) => {
        if(10 > arr.length){
          return false;
        }
        return arr
        .slice()
        .sort((a, b) => {
          return b.score - a.score
        })
        .slice(0, x);
      };

    if (req.query.boostfruit === "on") {
      console.log('test');
      let newList = [];
      let list = topX(index.search(req.query.searchfruit), req.query.limitfruit);
      list.forEach(element => {
        newList.push(element.ref);
      });
      let query = Page.find({name: {$in: newList}});
      query.exec(function(err, users_result) {
        if (!err) {
          users_result.forEach(element => {
            let index = list.findIndex(({ ref }) => ref === element.name);
            let elscore = parseFloat(list[index].score);
            let prscore = parseFloat(element.pagerank);
            list[index].score = elscore * prscore;
          });
          res.status(200).render('results', {pages: list});
        }
      });  
    } else {
      let newList = [];
      let list = topX(index.search(req.query.searchfruit), req.query.limitfruit);
      list.forEach(element => {
        newList.push(element.ref);
      });
      let query = Page.find({name: {$in: newList}});
      query.exec(function(err, users_result) {
        if (!err) {
          users_result.forEach(element => {
            let index = list.findIndex(({ ref }) => ref === element.name);
            //let elscore = parseFloat(list[index].score);
            let prscore = parseFloat(element.pagerank);
            list[index].score = prscore;
          });
          res.status(200).render('results', {pages: list});
        }
      //res.status(200).render('results', {pages: topX(index.search(req.query.searchfruit), req.query.limitfruit)});
    });
  }
    //next();
});

app.get("/fruits/:name", (req, res, next) => {
  Page.findOne({name: req.params.name}, function(err, doc) {
    res.status(200).render('pagefruit', {page: doc});
  });
});

app.get("/personal", (req, res, next) => {
  res.status(200).render('resultspersonal', {pages: []});
});


const index = elasticlunr(async function () {
    this.addField('name');
    this.addField('content');
    this.addField('incoming');
    this.addField('outgoing');
    this.setRef('name');
    //this.saveDocument(true);
    for await (let doc of Page.find()) {
      // use `doc`
      doc = doc.toObject();
      this.addDoc(doc);
    }
  });

app.listen(3000);
console.log("Server listening at http://localhost:3000");

