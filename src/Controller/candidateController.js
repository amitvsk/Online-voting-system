
const candidateModel = require('../Models/candidateModel');
const Validator = require("../Validator/valid");

const addCandidate = async function(req,res) {
    try{
        let data = req.body

        let {name, position,logo,AdharNo} = data

        /*----------------------------validations ----------------------------*/
        if(!Validator.isValidReqBody(data)){return res.status(400).send({status:false,msg:"Please provide user data"})}
    
        if(!Validator.isValid(name)) return res.status(400).send({status: false,message: "Name is Required"});
        if(!Validator.isValidString(name)) return res.status(400).send({status: false, message: "Invalid name : Should contain alphabetic characters only"});
        
        if(!Validator.isValid(position)) return res.status(400).send({status: false,message: "position is Required"});
        if(!Validator.isValidString(position)) return res.status(400).send({status: false, message: "Invalid position : Should contain alphabetic characters only"});

        
        if(!AdharNo) return res.status(400).send({status: false,message:"Adhar number is Required"});
        if(!/^[0-9]{12}$/.test(AdharNo)) return res.status(400).send({status: false,message: "Adhar number  is not valid minlenght:-12"});

        const isAdharUsed = await candidateModel.findOne({AdharNo: AdharNo,isDeleted:false });
        if (isAdharUsed) return res.status(400).send({ status: false, message:  "Adhar number is already used, try different one"});

        let save = await candidateModel.create(data);
        let allConditdate = await candidateModel.find({isDeleted:false});
        return res.status(201).send(allConditdate);
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const updateCandidate = async function (req, res) {
    try {
    
        let fieldToUpdate = {
            name:req.body.name,
            position:req.body.position,
            logo:req.body.logo
        };

        for (const [key, value] of Object.entries(fieldToUpdate)) {
            if (!value) delete fieldToUpdate[key];
        }


        const checkadmin = await candidateModel.findOneAndUpdate({AdharNo:req.body.AdharNo,isDeleted:false},{ $set: { ...fieldToUpdate } },
            { new: true })

        return res.status(201).send({ Status: true, message: "Updated", Data:checkadmin })
    }
    catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

// /**************************************** Delete Candidate ********************************************/

const deleteCandidate = async function (req, res) {
    try{
        let deleted = await candidateModel.findOneAndUpdate({AdharNo:req.body.AdharNo,isDeleted:false}, { $set: { isDeleted: true, deletedAt: new String(Date()) } }, { new: true });
        return res.status(200).send({ status: true, msg: "Deleted Successfully"}) // delete the Admin data and update the deletedAt
    }
    catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


module.exports = {addCandidate,updateCandidate,deleteCandidate}

