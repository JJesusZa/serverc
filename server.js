const express = require('express'); //traigo express

//Cors
const cors = require('cors'); //traigo cors

//Mogoose
const mongoose = require('mongoose'); //traigo mongose
mongoose
  .connect(
    'mongodb+srv://admin:admin123@payments.zrwm5af.mongodb.net/Sistema_pagos?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('Conectado a la base de datos');
  }); //conecto a la base de datos

const app = express();
app.use(cors()); //uso cors

//importar body-parser
const bodyParser = require('body-parser'); //traigo body-parser
app.use(bodyParser.json()); //y lo pongo en uso
app.use(bodyParser.urlencoded({ extended: true }));

const Worker = require('./models/Workers'); //traigo el modelo de workers
const Movements = require('./models/Movements'); //traigo el modelo de movements

const port = 3000; //declaro el puerto y lo pongo a escuchar
app.listen(port, () => {
  console.log(`Escuchando el puerto ${port}`);
});

//variables globales
const hrpormes = 192;
const sueldoFijo = 30 * hrpormes;

//funcion que recibe el id del trabajador y calcula sus bonos
const calculateBonus = (type) => {
  //si el rol es 0 el pago total por bonos es de 10*horas por mes
  if (type == 0) {
    return 10 * hrpormes;
  }
  //si el rol es 1 el pago total por bonos es de 5*horas por mes
  if (type == 1) {
    return 5 * hrpormes;
  }
  //si el rol es 2 el pago total por bonos es de 0
  if (type == 2) {
    return 0;
  }
};

//funcion que calcula las retenciones
const calculateRetention = (salary) => {
  //se retiene el 9% del salario
  let retention = salary * 0.09;
  //si el salario es mayor a 10000 se retiene el 3% adicional
  if (salary > 10000) {
    retention += salary * 0.03;
  }
  return retention;
};

//funcion para traer el worker por id
app.get('/API/worker/:id', (req, res) => {
  Worker.findById(req.params.id)
    .then((worker) => {
      res.json(worker);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

//funcion que traiga a todos los workers de la base de datos Sistema_pagos y los entrega en json
app.get('/API/workers', (req, res) => {
  Worker.find().then((workers) => {
    res.json(workers);
  });
});

//funcion para agregar un worker a la base de datos
app.post('/API/workers', (req, res) => {
  const worker = new Worker({
    n_client: req.body.n_client,
    name: req.body.name,
    role: req.body.role,
  });
  worker.save().then((worker) => {
    res.json({ message: 'Trabajador agregado' });
  });
});

//funcion para editar un worker de la base de datos
app.put('/API/worker/:id', (req, res) => {
  Worker.findByIdAndUpdate(req.params.id, req.body).then((worker) => {
    res.json({ message: 'Trabajador actualizado' });
  });
});

//funcion para eliminar un worker de la base de datos
app.delete('/API/workers/:id', (req, res) => {
  Worker.findByIdAndDelete(req.params.id).then((worker) => {
    res.json({ message: 'Trabajador eliminado' });
  });
});

//funcion para traer el movement por id
app.get('/API/movement/:id', (req, res) => {
  Movements.findById(req.params.id)
    .then((movement) => {
      res.json(movement);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

//funcion que traiga a todos los movements de la base de datos Sistema_pagos y los entrega en json
app.get('/API/movements', (req, res) => {
  Movements.find().then((movements) => {
    res.status(200).json(movements);
  });
});

//funcion para agregar un movement a la base de datos
app.post('/API/movements', (req, res) => {
  const movement = new Movements({
    n_client: req.body.n_client,
    name: req.body.name,
    role: req.body.role,
    month: req.body.month,
    year: req.body.year,
    deliveries: req.body.deliveries,
  });
  movement.save().then((movement) => {
    res.json({ message: 'Movimiento agregado' });
  });
});

//funcion para editar un movement de la base de datos
app.put('/API/movement/:id', (req, res) => {
  Movements.findByIdAndUpdate(req.params.id, req.body).then((movement) => {
    res.json({ message: 'Movimiento actualizado' });
  });
});

//funcion para eliminar un movement de la base de datos
app.delete('/API/movements/:id', (req, res) => {
  Movements.findByIdAndDelete(req.params.id).then((movement) => {
    res.json({ message: 'Movimiento eliminado' });
  });
});

//funcion para traer los movimientos de un trabajador en un mes y año especifico
app.get('/API/movements/:id/:month/:year', (req, res) => {
  //traigo el id del trabajador
  const { id } = req.params;
  //traigo el mes y año
  const { month } = req.params;
  if (isNaN(month)) {
    res.json({ message: 'El mes debe ser un numero' });
  }
  const { year } = req.params;
  if (isNaN(year)) {
    res.json({ message: 'El año debe ser un numero' });
  }
  //primero busco el trabajador por id
  Worker.findById(id).then((worker) => {
    //si no lo encuentra envia un mensaje
    if (!worker) {
      res.json({ message: 'No se encontro el trabajador' });
    } else {
      //si lo encuentra busca los movimientos del trabajador en el mes y año especificado
      Movements.find({ n_client: worker.n_client, month, year })
        .then((movements) => {
          res.json(movements);
        })
        .catch((err) => {
          res.json({ message: err });
        });
    }
  });
});

//funcion para calcular el sueldo de un worker en un mes y año especifico
app.get('/API/calculateSalary/:id/:month/:year', (req, res) => {
  //traigo el id del worker
  const { id } = req.params;
  //traigo el worker de la base de datos
  Worker.findById(id).then((worker) => {
    //traigo el mes
    const { month } = req.params;
    if (isNaN(month)) {
      res.json({ error: 'El mes debe ser un numero' });
      return;
    }
    const { year } = req.params;
    if (isNaN(year)) {
      res.json({ error: 'El año debe ser un numero' });
      return;
    }
    //traigo los movimientos de ese worker de la base de datos
    Movements.find({
      n_client: worker.n_client,
      month: month,
      year: year,
    }).then((movements) => {
      //si el worker no tiene movimientos en el mes especificado se retorna un json con un mensaje
      if (movements.length == 0) {
        res.json({ message: 'No hay movimientos en este mes' });
        return;
      }
      //declaro las variables que voy a regresar en el json
      //para sacar el pago total de las entregas sumo todas las entregas de los movimientos
      let totalDeliveries = movements.reduce(
        (total, movement) => total + movement.deliveries,
        0
      );
      let pago_total_entregas = totalDeliveries * 5;
      let pago_total_bonos = calculateBonus(worker.role);
      //para sacar los vales se le suma el 4% a su sueldo fijo
      let vales = sueldoFijo * 0.04;
      let pago_total =
        sueldoFijo + pago_total_entregas + pago_total_bonos + vales;
      let retenciones = calculateRetention(pago_total).toFixed(2);
      let sueldo_neto = (pago_total - retenciones).toFixed(2);
      //regreso el json con los datos
      res.json({
        n_client: worker.n_client,
        name: worker.name,
        role: worker.role,
        pago_total_entregas: pago_total_entregas,
        pago_total_bonos: pago_total_bonos,
        vales: vales,
        pago_total: pago_total,
        retenciones: retenciones,
        sueldo_neto: sueldo_neto,
      });
    });
  });
});
