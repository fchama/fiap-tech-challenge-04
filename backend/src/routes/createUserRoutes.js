const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');

/** Rotas administrativas: somente professores autenticados. */
const createUserRoutes = (controller) => {
  const router = express.Router();

  router.use(authenticate, authorize('teacher'));

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
};

module.exports = createUserRoutes;
