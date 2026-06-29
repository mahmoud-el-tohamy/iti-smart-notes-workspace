import express from 'express';
import { getNotes, getNoteById, createNote, updateNote, deleteNote, getCategories } from '../controllers/notes.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/')
  .get(protect, getNotes)
  .post(protect, createNote);

router.route('/categories')
  .get(protect, getCategories);

router.route('/:id')
  .get(protect, getNoteById)
  .patch(protect, updateNote)
  .delete(protect, deleteNote);

export default router;
