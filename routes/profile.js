const express=require('express')
const profile=require('../controllers/profileController')

const route=express.Router();
route.get("/",profile.getProfile);
route.post("/",profile.postProfile);
module.exports=route