const mongoose = require('mongoose');
const Parameter = mongoose.model('Parameter');

module.exports = {
    getAllParameter(){
        return Parameter.find().exec();
    },
    addParameter(props){
        return new Parameter({
            name: props.name || "",
            type: props.type || "",
            value: props.value || "",
            status: props.status || ""
        }).save();
    }
};
