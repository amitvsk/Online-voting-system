const userModel = require('../Models/userModel')
const jwt = require("jsonwebtoken");
const Validator = require("../Validator/valid")


/************************************************ Create User data ************************************************** */

const Register = async function (req, res) {
    try{
        let data = req.body

        let {title, name, phone, email,AdharNo, password} = data
        
        /*----------------------------validations ----------------------------*/
        if(!Validator.isValidReqBody(data)){return res.status(400).send({status:false,msg:"Please provide user data"})}
       
        if(!Validator.isValid(title)) return res.status(400).send({status: false,message: "Title is Required"});
        if (!Validator.isValidTitle(title)) return res.status(400).send({ status: false, message: "Title must be : Mr/ Miss/ Mrs" })
        
        if(!Validator.isValid(name)) return res.status(400).send({status: false,message: "Name is Required"});
        if(!Validator.isValidString(name)) return res.status(400).send({status: false, message: "Invalid name : Should contain alphabetic characters only"});
       
        if (!phone) return res.status(400).send({status: false,message: "Phone is Required"});
        if (!Validator.isValidPhone(phone))  return res.status(400).send({ status: false, message: "Invalid phone number : must contain 10 digit and only number."});

        //check unique phone
        const isPhoneUsed = await userModel.findOne({phone: phone });
        if (isPhoneUsed) return res.status(400).send({ status: false, message:"phone is already used, try different one"});

        if(!Validator.isValid(email)) return res.status(400).send({status: false,message: "Email is Required"});
        if (!Validator.isValidEmail(email)) return res.status(400).send({ status: false, message: "Invalid email address"});

        //check unique email
        const isEmailUsed = await userModel.findOne({email: email });
        if (isEmailUsed) return res.status(400).send({ status: false, message:  "email is already used, try different one"});

        
        if(!AdharNo) return res.status(400).send({status: false,message:"Adhar number is Required"});
        if(!/^[0-9]{12}$/.test(AdharNo)) return res.status(400).send({status: false,message: "Adhar number  is not valid minlenght:-12"});

        const isAdharUsed = await userModel.findOne({AdharNo: AdharNo,isDeleted:false });
        if (isAdharUsed) return res.status(400).send({ status: false, message:  "Adhar number is already used, try different one"});
    
        if(!Validator.isValid(password)) return res.status(400).send({status: false,message: "Password is Required"});
        if (!Validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "Invalid password (length : 8-16) : Abcd@123456"});

        if(!/^[0-9]{6}$/.test(data.address.pincode)) return res.status(400).send({status: false,message: "Pincode  is not valid minlenght:-6"});

        /*-------------------create user ---------------------------------------------*/ 
        let savedData = await userModel.create(data);
        return res.status(201).send({ status: true, data: savedData});
    }
    catch(err){
       return res.status(500).send({ status : false , message: err.message});
    }
};


/**************************************** Login user ******************************************/

const Login =async function(req,res){
    try{
        let data =req.body
        const{ email, password} = data

        /*----------------------------validations ----------------------------*/
        if(!Validator.isValidReqBody(data)){return res.status(400).send({status:false,msg:"Please provide user details"})}
       
        if(!Validator.isValid(email)){ return res.status(400).send({status: false,message: "Email is Required"});}
      
        if(!Validator.isValid(password)){return res.status(400).send({status: false,message: "Password is Required"});}
       
        let logCheck = await userModel.findOne({email:email,password:password});
        if(!logCheck){
            return res.status(400).send({ status: false, message: "This email id and password not valid"});
        }
       
        //create the jwt token 
        let token = jwt.sign({
            AdharNo:logCheck.AdharNo,
            project:onlineVotingSystemUser

        },"Amit/chandan/majorProject",{expiresIn: "1200s" });

        res.setHeader("x-api-key", token);   
       return res.status(200).send({ status: true, message: "Login Successful"})
    }
    catch(err){
        return res.status(500).send({status : false , message: err.message});
    }
}

const getvoter = async function (req, res) {
    try {
        let fieldToUpdate = {
            userId: req.query.userId,
            name: req.query.name,
            email: req.query.email
        };

        for (const [key, value] of Object.entries(fieldToUpdate)) {
            if (!value) delete fieldToUpdate[key];
        }
        const user = await userModel.find({ $and: [{ isDeleted: false }, fieldToUpdate] }).select({ _id: 0,isDeleted:0 }).collation({locale : "en"}).sort({ name: 1 });
        if (user.length == 0) return res.status(404).send({ status: false, message: "No voter found" })

        return res.status(200).send({ status: true, message: "Voters list", data: user })
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


const updateVoter = async function (req, res) {
    try {
    
        let fieldToUpdate = {
            title: req.body.title,
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            address:req.body.address
        };

        for (const [key, value] of Object.entries(fieldToUpdate)) {
            if (!value) delete fieldToUpdate[key];
        }

        const checkPhone = await userModel.findOne({phone: req.body.phone, isDeleted: false })
        if (checkPhone) {
            return res.status(400).send({ status: false, message: 'Mobile should be unique please try with another option' })
        }

        const checkemail = await userModel.findOne({ email: req.body.email, isDeleted: false })
        if (checkemail) {
            return res.status(400).send({ status: false, message: 'Email should be unique please try with another option' })
        }

        const checkVoter = await userModel.findOneAndUpdate({AdharNo:req.body.AdharNo,isDeleted:false},{ $set: { ...fieldToUpdate } },
            { new: true })

        return res.status(201).send({ Status: true, message: "Updated", Data:checkVoter })
    }
    catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

// /**************************************** Delete voter********************************************/

const deleteVoter = async function (req, res) {
    try{
        const AdharNo = req.body.AdharNo
        let deleted = await userModel.findOneAndUpdate({AdharNo:AdharNo,isDeleted:false}, { $set: { isDeleted: true, deletedAt: new String(Date()) } }, { new: true });
        return res.status(200).send({ status: true, msg: "Deleted Successfully"}) // delete the voter data and update the deletedAt
    }
    catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


module.exports = {Register, Login,getvoter,updateVoter,deleteVoter}





