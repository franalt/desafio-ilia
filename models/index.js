const mongoose = require("mongoose");

const BatidaSchema = new mongoose.Schema({
    momento: {
        type: Date,
        required: true
    }
});

const ExpedienteSchema = new mongoose.Schema({
    dia: {
        type: String,
        validate: {
            validator: function (value) {
                return /^\d{4}-\d{2}-\d{2}$/.test(value);
            },
            message: "{VALUE} must be in YYYY-MM-DD format"
        },
        required: true
    },
    horasTrabalhadas: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value"
        },
        required: true
    },
    batidas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batida"
        }
    ]
});

const Batida = mongoose.model("Batida", BatidaSchema);
const Expediente = mongoose.model("Expediente", ExpedienteSchema);

module.exports = { Batida, Expediente };
