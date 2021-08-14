const path = require("path");
const { forEach } = require("../data/dishes-data");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// middleware for the `create` (POST) and 'update' (PUT) methods
// checks validity of the values passed in  
const isDishValid = (req, res, next) => {
    const {
        id = null,
        name = null,
        description = null,
        price = null,
        image_url = null
    } = req.body.data;

    const { dishId = null } = req.params;

    if ((id && dishId) && id !== dishId)
        next({status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`})

    const properties = {name, description, price, image_url};
    const allPropertiesExist = Object.values(properties).every((prop)=> prop);

    if (!allPropertiesExist || isNaN(price) || typeof price == "string" || price <= 0)
        next({status: 400, message: "id, name, description, price, or image_url missing"});
    
    res.locals.newOrUpdatedDish = properties;
    next();
}
// middleware for the 'create' (POST) method
// attempts to avoid adding duplicates
const isDishADuplicate = (req, res, next) => {
    const newOrUpdatedDish = res.locals.newOrUpdatedDish;
    const dishKeys = Object.keys(newOrUpdatedDish);
    dishes.map((dish)=>{
        if (
            dish.name.toLowerCase() === newOrUpdatedDish.name.toLowerCase() ||
            dish.image_url === newOrUpdatedDish.image_url
        ){
            next({status: 400, message: "Dish already exists"})
        }
    })
    next();
}

// middlware for 'read' (GET) and 'update' (PUT) methods
// makes sure dishId is valid
const isIdValid = (req, res, next) => {
    const { dishId = null } = req.params;
    const match = dishes.find((dish)=>dish.id === dishId);

    if (!match)
        next({status: 404, message: `Dish does not exist: ${dishId}.`});
    
    res.locals.dish = match;
    next();
}

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
    create: [isDishValid, isDishADuplicate, create],
    read: [isIdValid, read],
    update: [isIdValid, isDishValid, update],
    list
}