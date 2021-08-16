const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));

// there are two variables is res.locals:
// dish (obj)
//  - an existing dish that has not been tampered with

// newOrUpdatedDish (obj) 
// - depending on the method, is either an entirely new dish object or 
//  is a combination of dish and the validated body parameters
function validateBody(req, res, next){
    const {data= {}} = req.body;
    const reqInputs = ["name", "description", "price", "image_url"];
    const { dishId = null } = req.params;

    reqInputs.forEach((key)=>{
        // returns 400 w/which pieces of data are missing 
        if (!data[key]) return next({status: 400, message: `missing [${key}] value`});
        // handles price validation
        if (key === "price" && 
            (data[key] <= 0 || isNaN(data[key]) || typeof data[key] === "string"))
 
            return next({status: 400, message: "price must be greater than 0"})
    })
    // handles id body parameter not matching actual id
    if ((data.id && dishId) && data.id !== dishId)
        next({status: 400, message: `dish id does not match route id. Dish: ${data.id}, Route: ${dishId}`})

    if (req.method === "POST")
        res.locals.newOrUpdatedDish = data;
    if (req.method === "PUT"){
        res.locals.newOrUpdatedDish = {...res.locals.dish, ...data, id: dishId}
    }
    next();
}

// attempts to avoid adding duplicates
function isDishADuplicate(req, res, next){
    const newOrUpdatedDish = res.locals.newOrUpdatedDish;
    const dishKeys = Object.keys(newOrUpdatedDish);
    dishes.map((dish)=>{
        if (
            dish.name.toLowerCase() === newOrUpdatedDish.name.toLowerCase() ||
            dish.image_url === newOrUpdatedDish.image_url
        ){
            next({status: 400, message: "dish already exists"})
        }
    })
    next();
}

// makes sure dishId is valid
function isIdValid(req, res, next){
    const { dishId = null } = req.params;
    const match = dishes.find((dish)=>dish.id === dishId);

    if (!match)
        next({status: 404, message: `dish does not exist: ${dishId}.`});
    
    res.locals.dish = match;
    next();
}

module.exports = {
    validateBody,
    isDishADuplicate,
    isIdValid
}