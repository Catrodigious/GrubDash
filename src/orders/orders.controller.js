const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
// Created a separate module for middleware to tidy things up a bit
const {
  validateBody,
  validateUpdateInputs,
  isIdValid,
  verifyStatusBeforeDeletion 
} = require("./orders.middlware");

function create(req, res){
  const newOrUpdatedOrder = {id: nextId(), ...res.locals.newOrUpdatedOrder};
  if (!newOrUpdatedOrder.status) newOrUpdatedOrder.status = "pending";
  orders.push(newOrUpdatedOrder);
  res.status(201).json({data: newOrUpdatedOrder});
}

function read(req, res){
  res.status(200).json({data: res.locals.order});
}

function update(req, res){
  const newOrderDetails = res.locals.newOrUpdatedOrder;
  const existingOrder = orders.find((order)=>order.id === req.params.orderId);
  const index = orders.indexOf(existingOrder);
  orders[index] = {...existingOrder, ...newOrderDetails};
  res.status(200).json({data: orders[index]});
}

function destroy(req, res){
  const index = orders.indexOf(res.locals.order);
  orders.splice(index, 1);
  res.status(204).json({data: orders});
}

function list(req, res){
  res.status(200).json({data: orders})
}

module.exports = {
  create: [validateBody, create],
  update: [isIdValid, validateUpdateInputs, validateBody, update],
  read: [isIdValid, read],
  delete: [isIdValid, verifyStatusBeforeDeletion, destroy],
  list
}