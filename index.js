var client = require('oracle-client').direct();
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const app = express();

var port = process.env.PORT;
var user = process.env.ORACLE_USER;
var pass = process.env.ORACLE_PASSWORD;
var host = process.env.ORACLE_HOST;
var db = process.env.ORACLE_DATABASE;


var config = {
    user: pass,
    password: pass,
    host: host,
    database: db
};

router.get("/", async (req, res) => {
    res.json({
        status: 200,
        message: "Connection Done"
    });
});

router.get("/checkOracleConnection", async (req, res) => {
    client
        .connect(config)
        .then(connection => {
            try {
                if (connection) {
                    res.send("Connected with oracle database");
                }

            } catch (err) {
                res.send(err.message);
            }
        });

});

router.get("/getVoucher", async (req, res) => {
    async function getVouchersData() {
        client
            .connect(config)
            .then(connection => {
                return connection
                    .execute('SELECT * FROM VOUCHER')
                    .then(result => {
                        return connection
                            .close()
                            .then(() => {
                                console.log(result);
                                res.json(result);
                            });
                    })
                    .catch(err => {
                        return connection
                            .close()
                            .then(() => {
                                res.send(err);
                                console.log(err);
                                Promise.reject(err)
                            });
                    });
            });
    }

    getVouchersData();
});


router.get("/getBalance/:code", async (req, res) => {
    let partyCode = req.params.code;
    client
        .connect(config)
        .then(connection => {
            return connection
                .execute(getBalQuery(partyCode))
                .then(result => {
                    return connection
                        .close()
                        .then(() => {
                            res.json(result)
                            console.log(result);
                        });
                })
                .catch(err => {
                    return connection
                        .close()
                        .then(() => {
                            console.log(err);
                            Promise.reject(err)
                        });
                });
        });
});

const getBalQuery = (value) => {
    return `SELECT NVL(A.OP_BAL,0) + NVL(SUM(B.AMOUNT),0) BALANCE FROM MSTACCNT A LEFT JOIN TRNACC B ON A.ACC_CD = B.ACC_CD WHERE A.ACC_CD= '${value}' GROUP BY A.OP_BAL`
}

app.use(router);
app.listen(port, () => console.log(`Starting server on port ${port}`));
