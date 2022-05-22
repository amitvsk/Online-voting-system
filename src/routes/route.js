const express = require("express"); //import express
const router = express.Router(); //used express to create route handlers
const userController = require("../Controller/userController")
const adminController = require('../Controller/adminController')
const candidateController = require('../Controller/candidateController')
const {Authentication,Authorization} = require("../middleware/auth")

//user APIs
router.post('/register', userController.Register)
router.post("/login",userController.Login)
router.get('/voterDetails',userController.getvoter)
router.put('/updateVoter',userController.updateVoter)
router.delete('/deleteVoter',userController.deleteVoter)
//admin APIs
router.post('/adminRegister',adminController.adminCreate)
router.post('/adminLogin',adminController.Login)
router.get('/adminDetails',adminController.getadmin)
//candidate APIs
router.post('/candidateAdd',candidateController.addCandidate)
router.put('/updateCandidate',candidateController.updateCandidate)
router.delete('/deleteCandidate',candidateController.deleteCandidate)

module.exports = router;
