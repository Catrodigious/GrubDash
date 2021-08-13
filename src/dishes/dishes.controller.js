const path = require("path");
const { forEach } = require("../data/dishes-data");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res){
    res.status(200).json({data: `LIST called @ [${req.originalUrl}] `})
}

function create(req, res){
    res.status(200).json({data: `CREATE called @ [${req.originalUrl}] `})
}

function read(req, res){
    res.status(200).json({data: `READ called @ [${req.originalUrl}] `})
}

function update(req, res){
    res.status(200).json({data: `UPDATE called @ [${req.originalUrl}] `})
}

module.exports = {
    create,
    read,
    update,
    list
}