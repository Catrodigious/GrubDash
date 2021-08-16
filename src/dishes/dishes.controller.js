const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const {
    validateBody,
    isDishADuplicate,
    isIdValid
} = require("./dishes.middleware");

function list(req, res){
    res.status(200).json({data: dishes})
}

function create(req, res){
    const newOrUpdatedDish = {id: nextId(), ...res.locals.newOrUpdatedDish};
    dishes.push(newOrUpdatedDish);
    res.status(201).json({data: newOrUpdatedDish});
}

function read(req, res){
    res.status(200).json({data: res.locals.dish})
}

function update(req, res){
    const { id = null } = req.body;

    const index = dishes.indexOf(res.locals.dish);
    dishes[index] = {...dishes[index], ...res.locals.newOrUpdatedDish};

    res.status(200).json({data: dishes[index]})
}

module.exports = {
    create: [validateBody, isDishADuplicate, create],
    read: [isIdValid, read],
    update: [isIdValid, validateBody, update],
    list
}