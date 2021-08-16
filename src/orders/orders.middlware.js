const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));

// there are two variables is res.locals:
// order (obj)
//  - an existing order that has not been tampered with

// newOrUpdatedOrder (obj) 
// - depending on the method, is either an entirely new object or 
//  is a combination of order and the validated body parameters
function validateBody(req, res, next){
    const {data = {}} = req.body;
    const reqInputs = ["deliverTo", "mobileNumber", "dishes"];
    const { orderId } = req.params;

    const validateDishes = (key) => {
        // array existence and length check
        if (!Array.isArray(data[key]) || data[key].length === 0)
            return next({status: 400, message: `dishes must be an array`});

        data.dishes.forEach((dish, index)=>{
            if (!dish.quantity || typeof dish.quantity === "string" ||  dish.quantity <= 0){
                return next({status: 400, message: `Dish quantity must be at least 1 -- provided quantity for w/dish[${index}] was: [${dish.quantity}]`});
            }
        });
    }
    reqInputs.forEach((key)=>{
        // returns 400 w/which pieces of data are missing 
        if (!data[key]) return next({status: 400, message: `Missing [${key}] value`});
        // checks that dishes is an array
        if (key === "dishes")
            validateDishes(key);
    })
    if (req.method === "POST")
        res.locals.newOrUpdatedOrder = data;
    if (req.method === "PUT"){
        if (data.id !== orderId) delete data.id;
        res.locals.newOrUpdatedOrder = {...res.locals.order, ...data};
    }
    next();
}

function validateUpdateInputs(req, res, next){
    const {
        id,
        status
    } = req.body.data;
    const { orderId } = req.params;
    // if status is already delivered, make status unchangable
    const givenStatus = res.locals.order.status.toLowerCase();
    if (givenStatus === "delivered" || status === "invalid") next({status: 400, message: `status ${status} is invalid`})
    // body and param ids should match
    if (id && orderId !== id) return next({status: 400, message: `id of body (${id}) does not match the id parameter (${orderId})`})
    if (!status) return next({status: 400, message: "Please include a status in PUT body"});
    next();
}

function isIdValid(req, res, next){
    const { orderId = null } = req.params;
    const match = orders.find((order)=>order.id === orderId);

    if (!match)
        return next({status: 404, message: `order does not exist: ${orderId}.`});
    res.locals.order = match;
    next();
}

function verifyStatusBeforeDeletion(req, res, next){
    const order = res.locals.order;
    if (order.status !== "pending") return next({status: 400, message: `Cannot delete with order status ${order.status}; status must be 'pending'`});
    next();
}

module.exports = {
    validateBody,
    validateUpdateInputs,
    isIdValid,
    verifyStatusBeforeDeletion
}