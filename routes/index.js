const express = require("express");
const router = express.Router();
const Utils = require("../utils");
const moment = require("moment-timezone");
const { Batida, Expediente } = require("../models");

router.post("/v1/batidas", async (req, res) => {
    try {
        console.log("/v1/batidas", {
            body: req.body
        });
        if (!Utils.validateDate(req.body.momento)) {
            return res.status(400).json({ mensagem: "Horário do momento inválido" });
        }

        const momento = new Date(req.body.momento);
        const dia = req.body.momento.split("T")[0];

        let batidaExistente = await Batida.findOne({ momento });
        if (batidaExistente) {
            return res.status(409).json({ mensagem: "Horário já registrado" });
        }

        let expediente = await Expediente.findOne({ dia }).populate("batidas");
        if (!expediente) {
            expediente = new Expediente({
                dia,
                horasTrabalhadas: 0,
                batidas: []
            });
        }

        expediente.batidas.sort((a, b) => a.momento - b.momento);

        if (expediente.batidas.length === 2 && momento - expediente.batidas[1].momento < 3600000) {
            return res.status(400).json({ mensagem: "Deve haver no mínimo 1 hora de almoço" });
        }

        let batida = new Batida({
            momento
        });
        batida = await batida.save();

        expediente.batidas.push(batida._id);

        await expediente.save();

        expediente.batidas[expediente.batidas.length - 1].momento = momento;

        expediente.horasTrabalhadas = 0;

        for (let i = 0; i < expediente.batidas.length - 1; i += 2) {
            const startTime = expediente.batidas[i].momento;
            if (expediente.batidas[i + 1]) {
                const endTime = expediente.batidas[i + 1].momento;
                const duration = endTime - startTime;
                expediente.horasTrabalhadas += duration;
            }
        }

        await expediente.save();

        return res.status(201).json({
            dia: expediente.dia,
            pontos: expediente.batidas.map((object) => {
                return moment(object.momento).tz("America/Argentina/Buenos_Aires").format("HH:mm:ss");
            })
        });
    } catch (error) {
        console.error("Error processing batida", error);
        return res.status(500).json({ mensagem: "Internal Server Error" });
    }
});

router.get("/v1/folhas-de-ponto/:anoMes", async (req, res) => {
    try {
        console.log("/v1/folhas-de-ponto/:anoMes", {
            params: req.params
        });

        if (!Utils.validateYearMonth(req.params.anoMes)) {
            return res.status(400).json({ mensagem: "Data do relatório inválida" });
        }

        const regex = new RegExp(`^${req.params.anoMes}`);

        const expedientes = await Expediente.find({
            dia: { $regex: regex }
        }).populate("batidas");

        if (!expedientes.length) {
            return res.status(404).json({ mensagem: "Relatório não encontrado" });
        }

        const horasRequeridas = process.env.HORAS_DIARIAS ? Utils.hoursToMilliseconds(Number(process.env.HORAS_DIARIAS)) : Utils.hoursToMilliseconds(8);
        let horasTrabalhadas = 0;
        let horasExcedentes = 0;
        let horasDevidas = 0;
        for (let i = 0; i < expedientes.length; i++) {
            if (expedientes[i].horasTrabalhadas < horasRequeridas) {
                horasDevidas += Math.ceil(horasRequeridas - expedientes[i].horasTrabalhadas);
            } else {
                horasExcedentes += Math.ceil(expedientes[i].horasTrabalhadas - horasRequeridas);
            }
            horasTrabalhadas += expedientes[i].horasTrabalhadas;
        }

        return res.json({
            anoMes: req.params.anoMes,
            horasTrabalhadas: Utils.millisecondsToIso8601(horasTrabalhadas),
            horasExcedentes: Utils.millisecondsToIso8601(horasExcedentes),
            horasDevidas: Utils.millisecondsToIso8601(horasDevidas),
            expedientes: expedientes.map((expediente) => {
                return {
                    dia: expediente.dia,
                    pontos: expediente.batidas.map((ponto) => {
                        return moment(ponto.momento).tz("America/Argentina/Buenos_Aires").format("HH:mm:ss");
                    })
                };
            })
        });
    } catch (error) {
        console.error("Error fetching relatorio", error);
        return res.status(500).json({ mensagem: "Internal Server Error" });
    }
});

module.exports = router;
