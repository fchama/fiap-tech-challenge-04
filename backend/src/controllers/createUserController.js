const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Gera o CRUD (com listagem paginada) para um model de usuário.
 * `fields` lista os campos editáveis além de name/email/password.
 */
const createUserController = (Model, label, fields = []) => {
  const editable = ['name', 'email', ...fields];

  const pick = (body) =>
    editable.reduce((acc, key) => {
      if (body[key] !== undefined) acc[key] = body[key];
      return acc;
    }, {});

  const notFound = (res) =>
    res.status(404).json({ success: false, message: `${label} not found` });

  const invalidId = (res) =>
    res.status(400).json({ success: false, message: `Invalid ${label.toLowerCase()} ID format` });

  const list = async (req, res, next) => {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
      const q = (req.query.q || '').trim();

      const filter = q
        ? { $or: [{ name: new RegExp(escapeRegex(q), 'i') }, { email: new RegExp(escapeRegex(q), 'i') }] }
        : {};

      const [total, data] = await Promise.all([
        Model.countDocuments(filter),
        Model.find(filter)
          .sort({ name: 1 })
          .skip((page - 1) * limit)
          .limit(limit),
      ]);

      return res.status(200).json({
        success: true,
        count: data.length,
        total,
        page,
        pages: Math.max(Math.ceil(total / limit), 1),
        data,
      });
    } catch (error) {
      return next(error);
    }
  };

  const getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return invalidId(res);

      const user = await Model.findById(id);
      if (!user) return notFound(res);

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email and password are required',
        });
      }

      const user = await Model.create({ ...pick(req.body), password });
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      return next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return invalidId(res);

      const user = await Model.findById(id).select('+password');
      if (!user) return notFound(res);

      const changes = pick(req.body);
      // A senha só é alterada quando informada.
      if (req.body.password) changes.password = req.body.password;

      if (Object.keys(changes).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one field must be provided',
        });
      }

      user.set(changes);
      await user.save();

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      return next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return invalidId(res);

      if (req.auth && req.auth.id === id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account',
        });
      }

      const user = await Model.findByIdAndDelete(id);
      if (!user) return notFound(res);

      return res.status(200).json({
        success: true,
        message: `${label} deleted successfully`,
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };

  return { list, getById, create, update, remove };
};

module.exports = createUserController;
