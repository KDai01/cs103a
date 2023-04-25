/*
  transact.js -- Router for the transactList
*/
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction')
const User = require('../models/User')

// check if the user is logged in
isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// opens transactList page
router.get('/transact',
  isLoggedIn,
  async (req, res, next) => {
    sor = req.query.sortBy
    //console.log("Sorting by: ",sor)
    if (sor == "date") {
      res.locals.items = await Transaction.find({userId:req.user._id}).sort({date : 1})
    } else if (sor == "amount") {
      res.locals.items = await Transaction.find({userId:req.user._id}).sort({amount : -1})
    } else if (sor == "category") {
      res.locals.items = await Transaction.find({userId:req.user._id}).sort({category : 1})
    } else if (sor == "description") {
      res.locals.items = await Transaction.find({userId:req.user._id}).sort({description : 1})
    } else {
      res.locals.items = await Transaction.find({userId:req.user._id})
    }
    res.render('transactList');
});

router.get('/transact/byCategory',
  isLoggedIn,
  async (req, res, next) => {
    let results = await Transaction.aggregate([
        {$match:{userId : req.user._id}},
        {$group:{_id:'$category', totalAmount:{$sum:'$amount'}}},
        {$sort:{totalAmount:-1}}
      ])
    res.render('transactListGrouped',{results});
});

// add a transaction
router.post('/transact',
  isLoggedIn,
  async (req, res, next) => {
      const transact = new Transaction(
        {description:req.body.description,
          amount: parseFloat(req.body.amount),
          category: req.body.category,
          date: req.body.date,
          userId: req.user._id
        })
      await transact.save();
      res.redirect('/transact')
});

// delete a transaction
router.get('/transact/delete/:id',
  isLoggedIn,
  async (req, res, next) => {
    console.log("inside /transact/delete/:id")
    await Transaction.deleteOne({_id:req.params.id})
    res.redirect('/transact')
});

// edit a transaction
router.get('/transact/edit/:id',
  isLoggedIn,
  async (req, res, next) => {
    console.log("inside /transact/edit/:id");
    const item = await Transaction.findById({_id:req.params.id});
    res.locals.item = item
    res.render('editTransact')
});

// update a transaction
router.post('/transact/updateTransaction',
  isLoggedIn,
  async (req, res, next) => {
    const {id,description,amount,category,date} = req.body;
    console.log("inside /transact/updateTransaction");
    await Transaction.findOneAndUpdate(
      {_id:id},
      {$set: {description,amount,category,date}}
    );
    res.redirect('/transact')
});

module.exports = router;
