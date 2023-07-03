//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema); 

const item1 = new Item ({
    name: "10 mins of meditation"
})

const item2 = new Item ({
    name: "Exercise"
})

const item3 = new Item ({
    name: "Read a book"
})

const defaultItems = [item1 , item2 , item3];

const ListSchema = {
    name : String,
    items : [itemSchema]
};

const List = mongoose.model("List", ListSchema);


app.get("/", function(req, res) {
  Item.find({})
    .then(result => {
      res.render("list", { listTitle: "Today", newListItems: result });
    })
    .catch(err => {
      console.log(err);
    });
});



app.post("/", function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName == "Today"){
      item.save();
      res.redirect("/");
    }
    else{
      List.findOne({name: listName})
        .then(foundList => {
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        })
    }


});

app.post("/delete", function(req,res) {
    const checkedItemId =  req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
      Item.findByIdAndRemove({ _id: checkedItemId})
      .then(result => {
        console.log("successfully deleted the checked one");
        res.redirect("/");
      })
      .catch(err => {
        console.log(err);
      });
    }
    else{
      List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
       .then(foundList => {
         res.redirect("/" + listName);
       })
      //  .catch(err => {
      //   console.log(err);
      //  })

    }
     
});

app.get("/:categoryName" , function(req, res) {
  const categoryName = _.capitalize(req.params.categoryName);

  List.findOne({ name: categoryName })
    .then(foundList => {
      if (!foundList) {
        // Create a new list
        console.log("doesnt exist");
        const list = new List({
          name: categoryName,
          items: defaultItems
        });
        list.save()
          .then(() => {
            res.redirect("/" + categoryName);
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        console.log("exists");
        // Show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch(err => {
      console.log(err);
    });
});



 

app.get("/work", function(req,res){
    res.render("list", {listTitle: "Work List", newListItems : workItems})
});

app.listen(3000, function(req,res){
    console.log("server is running on port 3000")
})

