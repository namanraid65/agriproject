import Settings from '../models/Settings.js';
import AppError from '../utils/AppError.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    res.status(200).json({ status: 'success', data: { settings } });
  } catch (err) { next(err); }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    const disallowed = ['_singleton', '_id', '__v'];
    disallowed.forEach(k => delete req.body[k]);
    Object.assign(settings, req.body);
    const updated = await settings.save();
    res.status(200).json({ status: 'success', data: { settings: updated } });
  } catch (err) { next(err); }
};
