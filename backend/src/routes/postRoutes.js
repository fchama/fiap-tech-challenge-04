const express = require('express');
const {
  listPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
} = require('../controllers/postController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Leitura pública (professores, alunos e visitantes)
router.get('/search', searchPosts);
router.get('/', listPosts);
router.get('/:id', getPostById);

// Escrita: somente professores autenticados
router.post('/', authenticate, authorize('teacher'), createPost);
router.put('/:id', authenticate, authorize('teacher'), updatePost);
router.delete('/:id', authenticate, authorize('teacher'), deletePost);

module.exports = router;
