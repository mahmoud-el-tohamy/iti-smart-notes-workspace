import { Request, Response } from 'express';
import { Note } from '../models/Note';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
  isPinned: z.boolean().optional(),
});

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Note.distinct('category', { userId: req.user._id });
    res.json(categories.filter(Boolean)); // Filter out null/undefined/empty string categories if any
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, status, page = '1', limit = '10', sortBy = 'updatedAt', order = 'desc' } = req.query;

    const query: any = { userId: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = { isPinned: -1, [sortBy as string]: sortOrder };

    const notes = await Note.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    if (note.userId.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    res.json(note);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid input', errors: parsed.error.issues });
      return;
    }

    const note = new Note({
      ...parsed.data,
      userId: req.user._id,
    });

    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    if (note.userId.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const parsed = noteSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid input', errors: parsed.error.issues });
      return;
    }

    Object.assign(note, parsed.data);
    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    if (note.userId.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
