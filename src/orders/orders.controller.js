const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
// in the src/orders/orders.controller.js file, add handlers and middleware functions to create, read, update, delete, and list orders.

function messageFormatter(i, index, invalidIndices, keys){
  if (invalidIndices.length <= 2 && index == 0)
  return `[${keys[i]}]`
if (invalidIndices.length >= 3 && index < invalidIndices.length - 1) 
  return `[${keys[i]}],`
if (index === invalidIndices.length - 1) 
  return `and [${keys[i]}]`
}
const validateInputs = (req, res, next) => {
  const {
    deliverTo = null,
    mobileNumber = null,
    dishes = null,
    quantity = null
  } = req.body.data;
  const params = {deliverTo, mobileNumber, dishes, quantity};
  const invalidIndices = Object.values(params)
    .map((param, index) => !param && index) // filters out all invalid indices
    .filter((param)=>param); // filters out 'undefined' values


    const keys = Object.keys(params);
    // clean this up
    const message = invalidIndices.map((i, index)=>{
      return messageFormatter(i, index, invalidIndices, keys);
    })
    message.push("parameters had invalid values");
    const newMessage = message.join(" ");

  next({status: 400, message: newMessage })

}

function create(req, res){
  res.status(200).json({data: `Call made to ${req.originalUrl}`})
}

function read(req, res){
  res.status(200).json({data: `Call made to ${req.originalUrl}`})
}

function update(req, res){
  res.status(200).json({data: `Call made to ${req.originalUrl}`})
}

function destroy(req, res){
  res.status(200).json({data: `Call made to ${req.originalUrl}`})
}

function list(req, res){
  res.status(200).json({data: orders})
}

module.exports = {
  create: [validateInputs, create],
  update,
  read: [read],
  delete: [destroy],
  list
}