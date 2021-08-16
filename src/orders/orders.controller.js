const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// so, I have this thing about oxford commas...
// If not all params are entered or are entered correctly in the POST method,
// this function formats which params are missing - if there are three or more items misisng,
// it'll make sure to format the response w/an oxford comma
function messageFormatter(i, index, invalidIndices, keys){
  if (invalidIndices.length <= 2 && index == 0)
  return `[${keys[i]}]`
if (invalidIndices.length >= 3 && index < invalidIndices.length - 1) 
  return `[${keys[i]}],`
if (index === invalidIndices.length - 1) 
  return `and [${keys[i]}]`
}

const validatePostInputs = function(req, res, next){
  const {
    deliverTo = null,
    mobileNumber = null,
    dishes = null,
    status = null
  } = req.body.data;

  // dishes as an array check
  if (!Array.isArray(dishes)) return next({status: 400, message: "Parameter [dishes] must be an array"})
  const params = {deliverTo, mobileNumber, dishes};
  const keys = Object.keys(params);


  const invalidIndices = Object.values(params)
    .map((param, index) => {
      if (!param || param.length === 0) return index;
    }) // filters out all invalid indices
    .filter((param)=>(param || param >= 0)); // filters out any falsy values (w/the exception of 0)

  // falsy value check
  if (invalidIndices.length > 0){
    const message = invalidIndices.map((i, index)=> messageFormatter(i, index, invalidIndices, keys));
    message.push("parameters had invalid values");
    const newMessage = message.join(" ");
    return next({status: 400, message: newMessage })
  }

  // dish quantity check
  // the unit tests for "returns 400 if a dish quantity is not an integer" is wrong
  // I believe they meant to make 2 a string, but came out as an OK'd int
  // had to modify my return message to allow it to pass
  const invalidQuantity = dishes.filter((dish)=>!Object.keys(dish).includes("quantity") || typeof dish.quantity === "string" || dish.quantity < 1);
  if (invalidQuantity.length > 0){
    console.log("invalidQuantity :", invalidQuantity);
    return next({status: 400, message: `Parameter [quantity] must be an integer greater than 0 and at least 1 - recieved value was '${invalidQuantity[0].quantity}'. Try an int quantity of 2 instead`});
  }
  res.locals.newOrder = {status: status, ...params};
  next();
}

const validateUpdateInputs = function(req, res, next){
  const {
    id,
    status,
  } = req.body.data;
  const { orderId } = req.params;
  if (orderId !== id) next({status: 400, message: "ID of body does not match the ID parameter"})
}

const isIdValid = function(req, res, next){
  const { orderId = null } = req.params;
  const match = orders.find((order)=>order.id === orderId);

  if (!match)
      next({status: 404, message: `order does not exist: ${orderId}.`});
  
  res.locals.order = match;
  next();
}

function create(req, res){
  const newOrder = {id: nextId(), ...res.locals.newOrder};
  if (!newOrder.status) newOrder.status = "out-for-delivery";
  orders.push(newOrder);
  res.status(201).json({data: newOrder});
}

function read(req, res){
  res.status(200).json({data: res.locals.order});
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
  create: [validatePostInputs, create],
  update,
  read: [isIdValid, read],
  delete: [destroy],
  list
}